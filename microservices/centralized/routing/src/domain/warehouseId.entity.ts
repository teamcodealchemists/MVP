export class WarehouseId {
    constructor(
        private id: number,
    ) { 
    }

    getId(): number {
        return this.id;
    }

    equals(other: WarehouseId): boolean {
    // Assuming there is an 'id' property to compare
    return this.id === other.id;
  }
}