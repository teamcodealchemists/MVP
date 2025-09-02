
export interface WarehouseSubscriber {
  createWarehouse(dto:{state:string, address:string}): Promise<string|false>;
}