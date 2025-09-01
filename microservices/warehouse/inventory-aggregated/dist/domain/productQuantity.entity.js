"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductQuantity = void 0;
class ProductQuantity {
    constructor(id, quantity) {
        this.id = id;
        this.quantity = quantity;
    }
    getId() {
        return this.id;
    }
    getQuantity() {
        return this.quantity;
    }
}
exports.ProductQuantity = ProductQuantity;
