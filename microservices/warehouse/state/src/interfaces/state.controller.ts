// src/interfaces/http/state.controller.ts
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { WarehouseStateDTO } from './dto/warehouse-state.dto';
import { InboundPortsAdapter } from '../infrastructure/adapters/portAdapters/inboundPortAdapters';
import { Heartbeat } from '../domain/heartbeat.entity';

@Controller()
export class StateController{
  private readonly logger = new Logger(StateController.name);

  constructor(
    private readonly inboundPortsAdapter: InboundPortsAdapter,
  ) {}

  @MessagePattern('call.state.get')
  async getSyncedState(data: any): Promise<void> {
    this.logger.log(`Raw inbound data: ${JSON.stringify(data)}`);
    let warehouseId = 0;

    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        this.logger.error('Error parsing inbound JSON string', e);
      }
    }

    if (data?.warehouseId?.id && typeof data.warehouseId.id === 'number') {
      warehouseId = data.warehouseId.id;
    }

    this.logger.log(`Received getSyncedState request for warehouse ${warehouseId}`);

    const warehouseIdDTO = { id: warehouseId };
    this.inboundPortsAdapter.getSyncedState(warehouseIdDTO)
    return Promise.resolve();
  }
}
