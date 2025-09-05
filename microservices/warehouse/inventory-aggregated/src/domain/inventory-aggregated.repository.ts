import { Product } from "src/domain/product.entity";
import { ProductId } from "./productId.entity";
import { InventoryAggregated } from "./inventory-aggregated.entity";

export interface InventoryAggregatedRepository {
  addProduct(product: Product): Promise<void>;
  updateProduct(product: Product): Promise<void>;
  removeById(id: ProductId): Promise<void>;
  getById(id: ProductId): Promise<Product | null>;
  getAll(): Promise<InventoryAggregated>;
  getAllProducts(): Promise<InventoryAggregated>;
}
