export class WarehouseId {
  private warehouseId: number;

  constructor(warehouseId: number) {
    this.warehouseId = warehouseId;
  }

  public getId(): number {
    return this.warehouseId;
  }
}
