import { WarehouseId } from "../warehouseId.entity";

export interface WarehouseRoutingPublisher {
  RequestDistanceWarehouse(warehouseId: WarehouseId): void;
}
