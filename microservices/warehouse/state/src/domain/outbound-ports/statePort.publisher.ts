import { WarehouseId } from "../warehouse-id.entity";
import { WarehouseState } from "../warehouse-state.entity";

export interface StatePortPublisher {
  publishState(warehouseId : WarehouseId ,state: WarehouseState): Promise<void>;
}