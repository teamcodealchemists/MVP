import { OrderId } from "../orderId.entity";
import { ProductId } from "../productId.entity";
import { WarehouseId } from "../warehouseId.entity";

export interface RequestResultPublisher {
  sendOrder(message : string, orderId : OrderId, warehouseId : WarehouseId): void
  sendInventory(message : string, productId : ProductId, warehouseId : WarehouseId): void
}
