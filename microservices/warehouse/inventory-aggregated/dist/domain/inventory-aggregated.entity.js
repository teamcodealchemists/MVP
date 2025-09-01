"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryAggregated = void 0;
class InventoryAggregated {
    constructor(productList) {
        this.productList = productList;
    }
    getInventory() {
        return this.productList;
    }
    addProductItem(itemToAdd) {
        this.productList.push(itemToAdd);
    }
}
exports.InventoryAggregated = InventoryAggregated;
