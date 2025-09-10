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

  @MessagePattern('call.cloud.checkHeartbeat')
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

    if (data?.warehouseId && typeof data.warehouseId === 'number') {
      warehouseId = data.warehouseId;
    }

    this.logger.log(`Received getSyncedState request for warehouse ${warehouseId}`);

    const warehouseIdDTO = { id: warehouseId };
    await this.inboundPortsAdapter.getSyncedState(warehouseIdDTO);
    // Non serve return, la risposta viene inviata tramite evento dal service
  } 
}