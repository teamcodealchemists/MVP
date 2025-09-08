import { Product } from "../product.entity";
export interface CriticalThresEventPort {
    belowMinThres(product: Product): void;
    aboveMaxThres(product: Product): void;
}
