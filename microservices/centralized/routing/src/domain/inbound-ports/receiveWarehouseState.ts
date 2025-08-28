import { WarehouseStateDTO } from "src/interfaces/dto/warehouseState.dto";

export interface ReceiveWarehouseState {
    updateWarehouseState(state: WarehouseStateDTO): Promise<void>;
}