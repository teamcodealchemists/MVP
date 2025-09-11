export class WarehouseId {
    private readonly warehouseId: number;

    constructor(warehouseId: number) {
        this.warehouseId = warehouseId;
    }

    getId(): number {
        return this.warehouseId;
    }
}