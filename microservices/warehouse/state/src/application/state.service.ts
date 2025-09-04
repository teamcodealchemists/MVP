// src/application/state.service.ts
import { Injectable, Inject, Logger } from '@nestjs/common';
import { WarehouseState } from '../domain/warehouse-state.entity';
import { WarehouseId } from '../domain/warehouse-id.entity';
import { StateRepository } from '../domain/mongodb/state.repository';

@Injectable()
export class StateService {
  private readonly logger = new Logger(StateService.name);

  constructor(
    @Inject('STATEREPOSITORY')
    private readonly stateRepository: StateRepository
  ) {}

  public async getState(warehouseId: WarehouseId): Promise<WarehouseState | null> {
    this.logger.log(`Fetching state for warehouse ${warehouseId.getId()}`);
    return await this.stateRepository.getState(warehouseId);
  }

  public async updateState(state: WarehouseState, warehouseId: WarehouseId): Promise<boolean> {
    this.logger.log(`Updating state for warehouse ${warehouseId.getId()} to ${state.getState()}`);
    return await this.stateRepository.updateState(state, warehouseId);
  }
}
