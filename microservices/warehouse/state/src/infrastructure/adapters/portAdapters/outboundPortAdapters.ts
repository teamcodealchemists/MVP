import { Injectable, Logger } from '@nestjs/common';
import { StatePortPublisher } from '../../../domain/outbound-ports/statePort.publisher';
import { WarehouseState } from '../../../domain/warehouse-state.entity';
import { WarehouseId } from '../../../domain/warehouse-id.entity';
import { HeartbeatDTO } from '../../../interfaces/dto/heartbeat.dto';
import { StateEventHandler } from '../../../interfaces/state-event.handler';
import { DataMapper } from '../../mappers/datamapper';
import { Heartbeat } from '../../../domain/heartbeat.entity';
@Injectable()
export class OutboundPortsAdapter implements StatePortPublisher {
  private readonly logger = new Logger(OutboundPortsAdapter.name);

  constructor(
    private readonly stateEvent : StateEventHandler
  ) {}

  async publishState(warehouseId : WarehouseId, state: WarehouseState): Promise<void> {
    try {
      this.logger.log(`Publishing state for warehouse: ${state.getState()}`);
      await this.stateEvent.publishState(warehouseId, state); 
    } catch (error) {
    const e = error as Error;
    this.logger.error(`Failed to publish warehouse state: ${e.message}`);
    }
  }

    async publishHeartbeat(heartbeat : Heartbeat): Promise<void> {
    const heartbeatDto = DataMapper.toDTOHeartbeat(heartbeat);
    try {
      await this.stateEvent.publishHeartbeat(heartbeatDto); 
    } catch (error) {
    const e = error as Error;
    this.logger.error(`Failed to publish warehouse state: ${e.message}`);
    }
  }
}