import { SyncProductIdDTO } from "src/interfaces/dto/syncProductId.dto";

export interface SyncRemovedStockEvent {
  syncRemovedStock(dto: SyncProductIdDTO): Promise<void>;
}