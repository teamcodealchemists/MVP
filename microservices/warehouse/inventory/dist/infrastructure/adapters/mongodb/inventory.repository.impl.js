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
exports.InventoryRepositoryMongo = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const inventory_entity_1 = require("../../../domain/inventory.entity");
const product_entity_1 = require("../../../domain/product.entity");
let InventoryRepositoryMongo = class InventoryRepositoryMongo {
    productModel;
    constructor(productModel) {
        this.productModel = productModel;
    }
    async addProduct(product) {
        const productValues = {
            id: product.getId().getId(),
            name: product.getName(),
            unitPrice: product.getUnitPrice(),
            quantity: product.getQuantity(),
            minThres: product.getMinThres(),
            maxThres: product.getMaxThres(),
        };
        const newProduct = new this.productModel(productValues);
        await newProduct.save();
    }
    async removeById(id) {
        const result = await this.productModel.deleteOne({ id: id.getId() }).exec();
        return result.deletedCount > 0;
    }
    async updateProduct(product) {
        await this.productModel.updateOne({ id: product.getId().getId() }, {
            name: product.getName(),
            unitPrice: product.getUnitPrice(),
            quantity: product.getQuantity(),
            minThres: product.getMinThres(),
            maxThres: product.getMaxThres(),
        }).exec();
    }
    async getById(id) {
        const productDoc = await this.productModel.findOne({ id: id.getId() }).exec();
        if (!productDoc)
            return null;
        return new product_entity_1.Product(productDoc.id, productDoc.name, productDoc.unitPrice, productDoc.quantity, productDoc.minThres, productDoc.maxThres);
    }
    async getAllProducts() {
        const productDocs = await this.productModel.find().exec();
        const products = productDocs.map((doc) => new product_entity_1.Product(doc.id, doc.name, doc.unitPrice, doc.quantity, doc.minThres, doc.maxThres));
        return new inventory_entity_1.Inventory(products);
    }
};
exports.InventoryRepositoryMongo = InventoryRepositoryMongo;
exports.InventoryRepositoryMongo = InventoryRepositoryMongo = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Product')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], InventoryRepositoryMongo);
//# sourceMappingURL=inventory.repository.impl.js.map