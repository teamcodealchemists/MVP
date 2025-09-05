import { Product } from "../product.entity";

export interface CriticalThresEventPort {
  belowMinThres(product: Product, warehouseId: string): Promise<void>;
  aboveMaxThres(product: Product, warehouseId: string): Promise<void>;
}
