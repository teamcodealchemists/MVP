export interface StockRemovedPort {
    stockRemoved(productId: string, warehouseId: string): void;
}
