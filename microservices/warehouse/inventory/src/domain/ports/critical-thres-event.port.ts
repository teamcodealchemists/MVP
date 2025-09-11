import { Product } from "../product.entity";
import { WarehouseId } from "../warehouseId.entity";

export interface CriticalThresEventPort {
  belowMinThres(product: Product, warehouseId: WarehouseId): Promise<void>;
  aboveMaxThres(product: Product, warehouseId: WarehouseId): Promise<void>;
}
