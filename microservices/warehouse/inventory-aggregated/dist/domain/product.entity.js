"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
class Product {
    constructor(id, name, unitPrice, quantity, minThres, maxThres, warehouseId) {
        this.id = id;
        this.name = name;
        this.unitPrice = unitPrice;
        this.quantity = quantity;
        this.minThres = minThres;
        this.maxThres = maxThres;
        this.warehouseId = warehouseId;
    }
    getId() {
        return this.id;
    }
    getName() {
        return this.name;
    }
    getUnitPrice() {
        return this.unitPrice;
    }
    getQuantity() {
        return this.quantity;
    }
    getMinThres() {
        return this.minThres;
    }
    getMaxThres() {
        return this.maxThres;
    }
    getWarehouseId() {
        return this.warehouseId.getId();
    }
    setName(newName) {
        this.name = newName;
    }
    setUnitPrice(newUnitPrice) {
        this.unitPrice = newUnitPrice;
    }
    setQuantity(newQuantity) {
        this.quantity = newQuantity;
    }
    setMinThres(newMinThres) {
        this.minThres = newMinThres;
    }
    setMaxThres(newMaxThres) {
        this.maxThres = newMaxThres;
    }
}
exports.Product = Product;
