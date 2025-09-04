import { Product } from "../product.entity";

export interface CriticalThresEventPort {
  belowMinThres(product: Product): Promise<void>;
  aboveMaxThres(product: Product): Promise<void>;
}
