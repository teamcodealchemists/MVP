import { CloudWarehouseId } from "./cloudWarehouseId.entity";

export class CloudWarehouseState {
    constructor(
        private warehouseId: CloudWarehouseId,
        private state: string,
    ) { 
    }

    getId(): CloudWarehouseId {
        return this.warehouseId;
    }

    getState(): string {
        return this.state;
    }
}