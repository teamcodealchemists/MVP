import { ProductId } from "../productId.entity";
import { WarehouseId } from "../warehouseId.entity";

export interface StockRemovedPort {
  stockRemoved(productId: ProductId, warehouseId: WarehouseId): Promise<void>;
}
