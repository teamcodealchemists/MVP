import { ProductId } from "../productId.entity";

export interface StockRemovedPort {
  stockRemoved(productId: string, warehouseId: number): Promise<void>;
}
