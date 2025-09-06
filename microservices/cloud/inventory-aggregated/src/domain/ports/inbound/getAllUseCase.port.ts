import { SyncInventoryDTO } from "src/interfaces/dto/syncInventory.dto";

export interface GetAllUseCase {
    getAll(): Promise<SyncInventoryDTO>;
}