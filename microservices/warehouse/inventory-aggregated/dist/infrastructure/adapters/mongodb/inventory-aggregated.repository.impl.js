"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryAggregatedRepositoryImpl = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const product_entity_1 = require("../../../domain/product.entity");
const syncProduct_schema_1 = require("./schemas/syncProduct.schema");
const productId_entity_1 = require("../../../domain/productId.entity");
const warehouseId_entity_1 = require("../../../domain/warehouseId.entity");
let InventoryAggregatedRepositoryImpl = class InventoryAggregatedRepositoryImpl {
    constructor(productModel) {
        this.productModel = productModel;
    }
    async addProduct(product) {
        const doc = new this.productModel({
            warehouseId: product.getWarehouseId(),
            id: product.getId(),
            name: product.getName(),
            unitPrice: product.getUnitPrice(),
            quantity: product.getQuantity(),
            minThres: product.getMinThres(),
            maxThres: product.getMaxThres(),
        });
        await doc.save();
    }
    async removeById(id) {
        const result = await this.productModel.deleteOne({ id }).exec();
        return result.deletedCount > 0;
    }
    async updateProduct(id, product) {
        await this.productModel.updateOne({ id }, {
            name: product.getName(),
            unitPrice: product.getUnitPrice(),
            quantity: product.getQuantity(),
            minThres: product.getMinThres(),
            maxThres: product.getMaxThres(),
            warehouseId: product.getWarehouseId(),
        }).exec();
    }
    async getById(id) {
        const productDoc = await this.productModel.findOne({ id }).exec();
        if (!productDoc)
            return null;
        return new product_entity_1.Product(new productId_entity_1.ProductId(productDoc.id), productDoc.name, productDoc.unitPrice, productDoc.quantity, productDoc.minThres, productDoc.maxThres, new warehouseId_entity_1.WarehouseId(productDoc.warehouseId));
    }
    async getAllProducts() {
        const docs = await this.productModel.find().exec();
        return docs.map(doc => new product_entity_1.Product(new productId_entity_1.ProductId(doc.id), doc.name, doc.unitPrice, doc.quantity, doc.minThres, doc.maxThres, new warehouseId_entity_1.WarehouseId(doc.warehouseId)));
    }
};
exports.InventoryAggregatedRepositoryImpl = InventoryAggregatedRepositoryImpl;
exports.InventoryAggregatedRepositoryImpl = InventoryAggregatedRepositoryImpl = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(syncProduct_schema_1.SyncProduct.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], InventoryAggregatedRepositoryImpl);
