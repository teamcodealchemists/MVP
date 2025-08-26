import { WarehouseStateDTO } from "../dto/warehouseState.dto";

export interface ReceiveWarehouseState {
    updateWarehouseState(state: WarehouseStateDTO): void;
}