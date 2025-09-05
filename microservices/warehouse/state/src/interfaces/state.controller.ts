// src/interfaces/http/state.controller.ts
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { WarehouseIdDTO } from './dto/warehouse-id.dto';
import { WarehouseStateDTO } from './dto/warehouse-state.dto';
import { GetStateUseCase } from '../domain/use-cases/get-state.usecase';
import { InboundPortsAdapter } from '../infrastructure/adapters/portAdapters/inboundPortAdapters';

@Controller()
export class StateController implements GetStateUseCase {
  private readonly logger = new Logger(StateController.name);

  constructor(
    private readonly inboundPortsAdapter: InboundPortsAdapter,
  ) {}

  @MessagePattern('call.state.get')
  async getSyncedState(@Payload() warehouseIdDTO: WarehouseIdDTO): Promise<WarehouseStateDTO> {
    this.logger.log(`Received getSyncedState request for warehouse ${warehouseIdDTO.id}`);
    return this.inboundPortsAdapter.getSyncedState(warehouseIdDTO);
  }
}
