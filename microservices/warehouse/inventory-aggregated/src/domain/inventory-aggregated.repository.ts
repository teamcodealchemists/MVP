import { Product } from "src/domain/product.entity";

export interface InventoryAggregatedRepository {
  addProduct(product: Product): Promise<void>;
  updateProduct(id: string, product: Product): Promise<void>;
  removeById(id: string): Promise<boolean>;
  getById(id: string): Promise<Product | null>;
  getAllProducts(): Promise<Product[]>;
}
