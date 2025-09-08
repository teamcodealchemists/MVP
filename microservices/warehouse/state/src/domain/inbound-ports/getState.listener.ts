import { WarehouseIdDTO } from "../../interfaces/dto/warehouse-id.dto";
import { WarehouseStateDTO } from "../../interfaces/dto/warehouse-state.dto";

export interface GetStateEventListener {
  getSyncedState(warehouseIdDTO: WarehouseIdDTO): Promise<void>;
}
