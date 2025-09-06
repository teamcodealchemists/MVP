import { SyncProductDTO } from "src/interfaces/dto/syncProduct.dto";

export interface SyncEditedStockEvent {
  syncEditedStock(dto: SyncProductDTO): Promise<void>;
}