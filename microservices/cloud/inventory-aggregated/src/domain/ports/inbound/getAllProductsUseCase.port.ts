import { SyncInventoryDTO } from "src/interfaces/dto/syncInventory.dto";

export interface GetAllProductsUseCase {
    getAllProducts(): Promise<SyncInventoryDTO>;
}