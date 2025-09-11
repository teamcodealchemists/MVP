export class CloudWarehouseId {
    constructor(
        private warehouseId: number,
    ) { 
    }

    getId(): number {
        return this.warehouseId;
    }

    equals(other: CloudWarehouseId): boolean {
    // Assuming there is an 'id' property to compare
    return this.warehouseId === other.warehouseId;
  }
}