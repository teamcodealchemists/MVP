import { WarehouseId } from "../warehouse-id.entity";
import { WarehouseState } from "../warehouse-state.entity";

export interface StateRepository {
  getState(warehouseId: WarehouseId): Promise<WarehouseState | null>;
  updateState(state: WarehouseState, warehouseId: WarehouseId): Promise<boolean>;
}

export const StateRepository = Symbol("STATE_REPOSITORY");
