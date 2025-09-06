import { SyncProductDTO } from "src/interfaces/dto/syncProduct.dto";

export interface SyncAddedStockEvent {
    syncAddedStock(dto : SyncProductDTO): Promise<void>;
}