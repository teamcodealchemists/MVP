import { WarehouseId } from "../warehouseId.entity";

export interface RequestResultPublisher {
  sendOrder(message : string): void
  sendInventory(message: string): void
}
