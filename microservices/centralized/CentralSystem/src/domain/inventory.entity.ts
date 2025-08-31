import { Product } from "./product.entity";

export class Inventory {
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