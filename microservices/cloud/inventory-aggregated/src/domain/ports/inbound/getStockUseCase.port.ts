import { SyncProductDTO } from "src/interfaces/dto/syncProduct.dto";
import { SyncProductIdDTO } from "src/interfaces/dto/syncProductId.dto";
import { SyncWarehouseIdDTO } from "src/interfaces/dto/syncWarehouseId.dto";

export interface GetStockUseCase {
    getProduct(id: SyncProductIdDTO, warehouseId: SyncWarehouseIdDTO): Promise<SyncProductDTO | null>;
    getProductAggregated(id: SyncProductIdDTO): Promise<SyncProductDTO | null>;
}