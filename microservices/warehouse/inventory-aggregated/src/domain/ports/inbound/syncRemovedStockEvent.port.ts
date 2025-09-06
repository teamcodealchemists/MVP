import { SyncProductIdDTO } from "src/interfaces/dto/syncProductId.dto";
import { SyncWarehouseIdDTO } from "src/interfaces/dto/syncWarehouseId.dto";

export interface SyncRemovedStockEvent {
  syncRemovedStock(idDto: SyncProductIdDTO, warehouseIdDto: SyncWarehouseIdDTO): Promise<void>;
}