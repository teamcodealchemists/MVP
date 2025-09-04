
import { Product } from "../product.entity";

export interface StockUpdatedPort {
  stockUpdated(product: Product, warehouseId: number): void;
}
