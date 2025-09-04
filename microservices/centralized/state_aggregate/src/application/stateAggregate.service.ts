import { Inject, Injectable } from '@nestjs/common';
import { CloudWarehouseId } from '../domain/cloudWarehouseId.entity';
import { CloudHeartbeat } from '../domain/cloudHeartbeat.entity';
import { CloudWarehouseState } from '../domain/cloudWarehouseState.entity';
import { CloudStateRepository } from '../domain/cloudState.repository';
import { CloudStateEventAdapter } from '../infrastructure/adapters/cloudState.event.adapter';

@Injectable()
export class StateAggregateService {
  constructor(
    @Inject('CLOUDSTATEREPOSITORY')
    private readonly cloudStateRepository: CloudStateRepository,
    private readonly CloudStateEventAdapter: CloudStateEventAdapter,
  ) {}

private heartbeatCallbacks: Array<(id: CloudWarehouseId, isAlive: boolean) => void> = [];

public onHeartbeatResponse(callback: (id: CloudWarehouseId, isAlive: boolean) => void) {
  this.heartbeatCallbacks.push(callback);
}

// Questo metodo viene chiamato dal controller
public handleHeartbeatResponse(id: CloudWarehouseId, isAlive: boolean) {
  this.heartbeatCallbacks.forEach(cb => cb(id, isAlive));
  this.heartbeatCallbacks = []; // pulisci le callback dopo la risposta
}

async checkHeartbeat(warehouseId: CloudWarehouseId): Promise<'ONLINE' | 'OFFLINE'> {
  this.CloudStateEventAdapter.publishHeartbeat(new CloudHeartbeat(warehouseId, 'ALIVE?', new Date()));

  const TIMEOUT_MS = 10000;
  return new Promise<'ONLINE' | 'OFFLINE'>((resolve) => {
    let resolved = false;

    const onResponse = (id: CloudWarehouseId, isAlive: boolean) => {
      if (id.equals(warehouseId) && !resolved) {
        resolved = true;
        resolve(isAlive ? 'ONLINE' : 'OFFLINE');
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

  getState(cloudWarehouseId: CloudWarehouseId): Promise<CloudWarehouseState | null> {
    return this.cloudStateRepository.getState(cloudWarehouseId);
  }

  updateState(cloudWarehouseState: CloudWarehouseState): Promise<boolean> {
    return this.cloudStateRepository.updateState(cloudWarehouseState);
  }
}
