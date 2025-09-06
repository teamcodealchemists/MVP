import { Product } from "./product.entity";

export class InventoryAggregated {
    constructor(
        private productList: Product[],
    ) { }

    getInventory(): Product[] {
        return this.productList;
    }
    addProductItem(itemToAdd: Product): void {
        this.productList.push(itemToAdd);
    }
}