import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RoutingRepository } from './../../../domain/routing.repository';
import { WarehouseId } from './../../../domain/warehouseId.entity';
import { WarehouseState } from './../../../domain/warehouseState.entity';
import { WarehouseAddress } from './../../../domain/warehouseAddress.entity';
import { RoutingDocument } from './schemas/routing.schema';



@Injectable()
export class RoutingRepositoryMongo implements RoutingRepository {
    constructor(
        @InjectModel('Routing') private routingModel: Model<RoutingDocument>,
    ) {}

    async saveWarehouse(warehouse: WarehouseId): Promise<void> {
        await this.routingModel.create({ warehouseId: warehouse.getId() });
    }

    async getWarehouseById(id: WarehouseId): Promise<WarehouseId | null> {
        const result = await this.routingModel.findOne({ warehouseId: id.getId() }).exec();
        return result ? new WarehouseId(result.warehouseId) : null;
    }

    async getAllWarehouses(): Promise<WarehouseId[]> {
        const results = await this.routingModel.find().exec();
        return results.map((doc: any) => new WarehouseId(doc.warehouseId));
    }

    async saveWarehouseAddress(address: WarehouseAddress): Promise<void> {
        await this.routingModel.create({
            warehouseId: address.getWarehouseState().getId().getId(),
            state: address.getWarehouseState().getState(),
            address: address.getAddress(),
        });
    }

    async removeWarehouseAddress(id: WarehouseId): Promise<void> {
        await this.routingModel.deleteOne({ warehouseId: id.getId() }).exec();
    }

    async updateWarehouseAddress(address: WarehouseAddress): Promise<void> {
        await this.routingModel.updateOne(
            { warehouseId: address.getWarehouseState().getId().getId() },
            {
                address: address.getAddress(),
            }
        ).exec();
    }

    async getWarehouseAddressById(id: WarehouseId): Promise<WarehouseAddress | null> {
        const result = await this.routingModel.findOne({ warehouseId: id.getId() }).exec();
        return result
            ? new WarehouseAddress(
                    new WarehouseState(new WarehouseId(result.warehouseId), result.state),
                    result.address
                )
            : null;
    }

    async getAllWarehouseAddresses(): Promise<WarehouseAddress[]> {
        const results = await this.routingModel.find().exec();
        return results.map(
            (doc: any) =>
                new WarehouseAddress(
                    new WarehouseState(new WarehouseId(doc.warehouseId), doc.state),
                    doc.address
                )
        );
    }

    async saveWarehouseState(state: WarehouseState): Promise<void> {
        await this.routingModel.create({
            warehouseId: state.getId().getId(),
            state: state.getState(),
        });
    }

    async getWarehouseStateById(id: WarehouseId): Promise<WarehouseState | null> {
        const result = await this.routingModel.findOne({ warehouseId: id.getId() }).exec();
        return result
            ? new WarehouseState(new WarehouseId(result.warehouseId), result.state)
            : null;
    }

    async getAllWarehouseStates(): Promise<WarehouseState[]> {
        const results = await this.routingModel.find().exec();
        return results.map(
            (doc: any) =>
                new WarehouseState(new WarehouseId(doc.warehouseId), doc.state)
        );
    }

    async updateWarehouseState(state: WarehouseState): Promise<void> {
        await this.routingModel.updateOne(
            { warehouseId: state.getId().getId() },
            { state: state.getState() }
        ).exec();
    }    
}