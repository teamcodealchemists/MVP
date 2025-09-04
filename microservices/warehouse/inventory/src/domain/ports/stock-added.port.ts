import { Product } from "../product.entity";

export interface StockAddedPort {
  stockAdded(product: Product, warehouseId: number): Promise<void>;
}
