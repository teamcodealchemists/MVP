import { InventoryAggregated } from "src/domain/inventory-aggregated.entity";

export interface GetAllUseCase {
    getAll(): Promise<InventoryAggregated>;
}