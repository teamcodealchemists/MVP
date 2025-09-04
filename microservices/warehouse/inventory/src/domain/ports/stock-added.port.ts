import { Product } from "../product.entity";
import { WarehouseId } from "../warehouseId.entity";

export interface StockAddedPort {
  stockAdded(product: Product, warehouseId: WarehouseId): Promise<void>;
}
