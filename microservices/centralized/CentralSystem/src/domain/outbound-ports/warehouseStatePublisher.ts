import { WarehouseId } from "../warehouseId.entity";

export interface WarehouseStatePublisher {
  RequestWarehouseState(id: WarehouseId): void;
}
