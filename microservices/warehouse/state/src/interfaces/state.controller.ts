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
  async getSyncedState(data: any): Promise<WarehouseStateDTO> {
    this.logger.log(`Raw inbound data: ${JSON.stringify(data)}`);

    let warehouseId = 0;

    // Se arriva come stringa JSON
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        warehouseId = parsed?.id ?? 0;
      } catch (e) {
        this.logger.error('Error parsing inbound JSON string', e);
      }
    } 
    // Se arriva già come oggetto
    else if (data && typeof data.id === 'number') {
      warehouseId = data.id;
    }

  

    this.logger.log(`Received getSyncedState request for warehouse ${warehouseId}`);

    const warehouseIdDTO = { id: warehouseId };

    return this.inboundPortsAdapter.getSyncedState(warehouseIdDTO);
  }
}
