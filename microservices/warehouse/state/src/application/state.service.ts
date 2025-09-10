// src/application/state.service.ts
import { Injectable, Inject, Logger } from '@nestjs/common';
import { WarehouseState } from '../domain/warehouse-state.entity';
import { WarehouseId } from '../domain/warehouse-id.entity';
import { StateRepository } from '../domain/mongodb/state.repository';
import { Heartbeat } from '../domain/heartbeat.entity';
import { OutboundPortsAdapter } from '../infrastructure/adapters/portAdapters/outboundPortAdapters';

@Injectable()
export class StateService {
  private readonly logger = new Logger(StateService.name);

  constructor(
    @Inject('STATEREPOSITORY')
    private readonly stateRepository: StateRepository,
    private readonly outboundPortAdapter : OutboundPortsAdapter,
  ) {}
  //FUNZIONI NON UTILIZZATE ATTUALMENTE, SI POTREBBE CONTINUARE IN CASO UTILIZZO DI INTERFACCIA PER AGGIORNARE REAL TIME DELLO STATO LOCALE
  /*public async getState(warehouseId: WarehouseId): Promise<WarehouseState | null> {
    this.logger.log(`Fetching state for warehouse ${warehouseId.getId()}`);
    return await this.stateRepository.getState(warehouseId);
  }

  public async updateState(state: WarehouseState, warehouseId: WarehouseId): Promise<boolean> {
    this.logger.log(`Updating state for warehouse ${warehouseId.getId()} to ${state.getState()}`);
    return await this.stateRepository.updateState(state, warehouseId);
  }*/

  //FUNZIONI USATE
  public async sendHeartBeat(warehouseId : WarehouseId, warehouseState : WarehouseState): Promise<void> {
    this.logger.log(`Fetching state for warehouse ${warehouseId.getId()}`);
      const finalResult = await this.syncHeartbeat(warehouseId , warehouseState);
      this.outboundPortAdapter.publishHeartbeat(finalResult); 
  }

  public async syncHeartbeat(warehouseId : WarehouseId , warehouseState : WarehouseState): Promise<Heartbeat>{
    const heartbeatMsg = "ONLINE"
    const tp = new Date(); 
    return Promise.resolve(new Heartbeat(warehouseId, heartbeatMsg, tp));
  }
}
