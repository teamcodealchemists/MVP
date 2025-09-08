import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { CloudWarehouseId } from '../domain/cloudWarehouseId.entity';
import { CloudHeartbeat } from '../domain/cloudHeartbeat.entity';
import { CloudWarehouseState } from '../domain/cloudWarehouseState.entity';
import { CloudStateRepository } from '../domain/cloudState.repository';
import { CloudStateEventAdapter } from '../infrastructure/adapters/cloudState.event.adapter';
import { Interval } from '@nestjs/schedule';

@Injectable()
export class StateAggregateService implements OnModuleInit {
  constructor(
    @Inject('CLOUDSTATEREPOSITORY')
    private readonly cloudStateRepository: CloudStateRepository,
    private readonly CloudStateEventAdapter: CloudStateEventAdapter,
  ) {}

  onModuleInit() {
    // Inizializza il servizio, ad esempio, sottoscrivendosi agli eventi
    this.startPeriodicHeartbeatCheck();
  }


private heartbeatCallbacks: Array<(id: CloudWarehouseId, isAlive: boolean) => void> = [];

public onHeartbeatResponse(callback: (id: CloudWarehouseId, isAlive: boolean) => void) {
  this.heartbeatCallbacks.push(callback);
}

// Questo metodo viene chiamato dal controller
public async handleHeartbeatResponse(id: CloudWarehouseId, isAlive: boolean): Promise<string> {
  this.heartbeatCallbacks.forEach(cb => cb(id, isAlive));
  this.heartbeatCallbacks = []; // pulisci le callback dopo la risposta
  return Promise.resolve(JSON.stringify({ result: "Heartbeat processed successfully" }));
}

@Interval(60000) // ogni 60 secondi
async startPeriodicHeartbeatCheck() {
  const allWarehouses = await this.cloudStateRepository.getAllWarehouseIds();
  for (const warehouseId of allWarehouses) {
    await this.checkHeartbeat(warehouseId);
  }
}

async checkHeartbeat(warehouseId: CloudWarehouseId): Promise<'ONLINE' | 'OFFLINE'> {
  this.CloudStateEventAdapter.publishHeartbeat(new CloudHeartbeat(warehouseId, 'ALIVE?', new Date()));

  const TIMEOUT_MS = 10000;
  return new Promise<'ONLINE' | 'OFFLINE'>((resolve) => {
    let resolved = false;

    const onResponse = async (id: CloudWarehouseId, isAlive: boolean) => {
      if (id.equals(warehouseId) && !resolved) {
        resolved = true;
        const newState = isAlive ? 'ONLINE' : 'OFFLINE';

        // Recupera lo stato attuale dal db
        const currentState = await this.cloudStateRepository.getState(warehouseId);

        // Se lo stato è cambiato, aggiorna il db
        if (!currentState || currentState.getState() !== newState) {
          await this.cloudStateRepository.updateState(new CloudWarehouseState(warehouseId, newState));
          this.CloudStateEventAdapter.publishState(new CloudWarehouseState(warehouseId, newState)); //pubblica evento di cambio stato per il routing 
        }

        resolve(newState);
      }
    };

    this.onHeartbeatResponse(onResponse);

    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve('OFFLINE');
      }
    }, TIMEOUT_MS);
  });
}

  async getState(cloudWarehouseId: CloudWarehouseId): Promise<CloudWarehouseState | null> {
    return await this.cloudStateRepository.getState(cloudWarehouseId);
  }

  async updateState(cloudWarehouseState: CloudWarehouseState): Promise<boolean> {
    return await this.cloudStateRepository.updateState(cloudWarehouseState);
  }

  public notifyStateUpdated(state: CloudWarehouseState): void {
    this.CloudStateEventAdapter.stateUpdated(state);
  }

  public publishState(state: CloudWarehouseState): void {
  this.CloudStateEventAdapter.publishState(state);
}
}
