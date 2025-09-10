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
  console.log('Registered heartbeat response callback');
  this.heartbeatCallbacks.push(callback);
}

// Questo metodo viene chiamato dal controller
public async handleHeartbeatResponse(id: CloudWarehouseId, isAlive: boolean): Promise<string> {
  console.log(`Handling heartbeat response for warehouse ${id.getId()}: isAlive=${isAlive}`);
  this.heartbeatCallbacks.forEach(cb => cb(id, isAlive));
  this.heartbeatCallbacks = []; // pulisci le callback dopo la risposta
  return Promise.resolve(JSON.stringify({ result: "Heartbeat processed successfully" }));
}

@Interval(30000) // ogni 30 secondi
async startPeriodicHeartbeatCheck() {
  console.log('Starting periodic heartbeat check for all warehouses');
  const allWarehouses = await this.cloudStateRepository.getAllWarehouseIds();
  console.log(`Found ${allWarehouses.length} warehouses to check`);

  if (allWarehouses.length === 0) {
    console.log('Nessun magazzino registrato.');
  }

  for (const warehouseId of allWarehouses) {
    console.log(`Checking heartbeat for warehouse ${warehouseId.getId()}`);
    await this.checkHeartbeat(warehouseId);
    console.log(`Completed heartbeat check for warehouse ${warehouseId.getId()}`);
  }
}


async checkHeartbeat(warehouseId: CloudWarehouseId): Promise<'ONLINE' | 'OFFLINE'> {
  console.log(`Sending heartbeat request to warehouse ${warehouseId.getId()}`);
  this.CloudStateEventAdapter.publishHeartbeat(new CloudHeartbeat(warehouseId, 'ALIVE?', new Date()));

  const TIMEOUT_MS = 10000;
  return new Promise<'ONLINE' | 'OFFLINE'>((resolve) => {
    let resolved = false;

    const onResponse = async (id: CloudWarehouseId, isAlive: boolean) => {
      if (id.equals(warehouseId) && !resolved) {
        resolved = true;
        const newState = isAlive ? 'ONLINE' : 'OFFLINE';
        console.log(`Heartbeat response received for warehouse ${warehouseId.getId()}: ${newState}`);

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
    console.log(`Registering heartbeat response callback for warehouse ${warehouseId.getId()}`);
    this.onHeartbeatResponse(onResponse);
    console.log(`Heartbeat request sent to warehouse ${warehouseId.getId()}, waiting for response...`);

    setTimeout(async() => {
      if (!resolved) {
        resolved = true;
        console.log(`Heartbeat timeout for warehouse ${warehouseId.getId()}: OFFLINE`);
        const currentState = await this.cloudStateRepository.getState(warehouseId);
        if (!currentState || currentState.getState() !== 'OFFLINE') {
          await this.cloudStateRepository.updateState(new CloudWarehouseState(warehouseId, 'OFFLINE'));          
          this.CloudStateEventAdapter.publishState(new CloudWarehouseState(warehouseId, 'OFFLINE'));
        }
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
