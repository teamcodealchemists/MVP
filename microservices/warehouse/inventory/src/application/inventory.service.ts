import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { WarehouseId } from '../domain/warehouseId.entity';

@Injectable()
export class Inventory {
    constructor(
        private warehouseId: WarehouseId
        //@Inject('InventoryRepository') private readonly inventoryRepository: InventoryRepositoryMongo
    ) {}
}