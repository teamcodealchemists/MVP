export class WarehouseId {
    private readonly warehouseId: string;

    constructor(warehouseId: string) {
        this.warehouseId = warehouseId;
    }

    getId(): string {
        return this.warehouseId;
    }
}