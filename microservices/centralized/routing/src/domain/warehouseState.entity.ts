import {WarehouseId} from './warehouseId.entity';

export class WarehouseState {
    constructor(
        private state: string,
        private warehouseId: WarehouseId,
    ) { 
    }

    getState(): string {
        return this.state;
    }

    getId(): WarehouseId {
        return this.warehouseId;
    }
}