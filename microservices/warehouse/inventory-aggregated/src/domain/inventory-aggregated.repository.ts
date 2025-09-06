import { Product } from "src/domain/product.entity";
import { ProductId } from "./productId.entity";
import { InventoryAggregated } from "./inventory-aggregated.entity";
import { WarehouseId } from "./warehouseId.entity";

export interface InventoryAggregatedRepository {
  addProduct(product: Product): Promise<void>;
  updateProduct(product: Product): Promise<void>;
  removeProduct(id: ProductId, warehouseId: WarehouseId): Promise<void>;
  getAll(): Promise<InventoryAggregated>;
  getAllProducts(): Promise<InventoryAggregated>;
  getProduct(id: ProductId, warehouseId: WarehouseId): Promise<Product | null>;
  getProductAggregated(id: ProductId): Promise<Product | null>;
}
