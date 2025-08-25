"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inventory = void 0;
class Inventory {
    productList;
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
exports.Inventory = Inventory;
//# sourceMappingURL=inventory.entity.js.map