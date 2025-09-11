
import { Product } from "../product.entity";
import { WarehouseId } from "../warehouseId.entity";

export interface StockUpdatedPort {
  stockUpdated(product: Product, warehouseId: WarehouseId): Promise<void>;
}
