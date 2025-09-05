import { InventoryAggregated } from "src/domain/inventory-aggregated.entity";

export interface GetAllProductsUseCase {
    getAllProducts(): Promise<InventoryAggregated>;
}