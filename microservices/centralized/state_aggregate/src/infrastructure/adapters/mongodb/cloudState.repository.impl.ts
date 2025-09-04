import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CloudStateRepository } from '../../../domain/cloudState.repository';
import type { CloudWarehouseId } from '../../../domain/cloudWarehouseId.entity';
import { CloudWarehouseState } from '../../../domain/cloudWarehouseState.entity';
import type { CloudStateModel } from './models/cloudState.model';


@Injectable()
export class CloudStateRepositoryMongo implements CloudStateRepository {
    constructor(
        @InjectModel('CloudState')
        private readonly cloudStateModel: CloudStateModel,
    ) {}

    async getState(cloudWarehouseId: CloudWarehouseId): Promise<CloudWarehouseState | null> {
        const result = await this.cloudStateModel.findOne({ cloudWarehouseId: cloudWarehouseId.getId() }).exec();

        return result ? new CloudWarehouseState(cloudWarehouseId, result.state) : null;
    }

    async updateState(cloudWarehouseState: CloudWarehouseState): Promise<boolean> {
        const result = await this.cloudStateModel.updateOne(
            { cloudWarehouseId: cloudWarehouseState.getId().getId() },
            { state: cloudWarehouseState.getState() },
            { upsert: true },
        ).exec();
        return result.acknowledged;
    }
}