import { Product } from "./product.entity";
export declare class Inventory {
    private productList;
    constructor(productList: Product[]);
    getInventory(): Product[];
    addProductItem(itemToAdd: Product): void;
}
