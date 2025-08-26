import {WarehouseId} from './warehouseId.entity';

export class WarehouseState {
    constructor(
        private warehouseId: WarehouseId,
        private state: string,
    ) { 
    }

    getState(): string {
        return this.state;
    }

    getId(): WarehouseId {
        return this.warehouseId;
    }
}