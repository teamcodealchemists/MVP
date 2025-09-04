import { WarehouseState } from "../warehouse-state.entity";

export interface StatePortPublisher {
  publishState(state: WarehouseState): Promise<void>;
}