// src/interfaces/mongodb/state.repository.impl.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StateRepository } from '../../domain/mongodb/state.repository';
import { WarehouseState } from '../../domain/warehouse-state.entity';
import { WarehouseId } from '../../domain/warehouse-id.entity';
import { StateDocument } from '../../infrastructure/adapters/mongodb/schemas/state.schema';
import { StateModel } from '../../infrastructure/adapters/mongodb/models/state.model';

@Injectable()
export class StateRepositoryMongo implements StateRepository {
  private readonly logger = new Logger(StateRepositoryMongo.name);

  constructor(
    @InjectModel('State') private readonly stateModel: StateModel
  ) {}

  async getState(warehouseId: WarehouseId): Promise<WarehouseState> {
    const doc = await this.stateModel.findOne({ warehouseId: warehouseId.getId() }).exec();
    if (!doc) {
      this.logger.warn(`No state found for warehouse ${warehouseId.getId()}`);
      return new WarehouseState('unknown'); // default state
    }
    return new WarehouseState(doc.state);
  }

 async updateState( state: WarehouseState, warehouseId: WarehouseId): Promise<boolean> {
    const result = await this.stateModel.updateOne(
      { warehouseId: warehouseId.getId() },
      { state: state.getState() },
      { upsert: true }
    ).exec();
    return result.acknowledged;
  }
}

