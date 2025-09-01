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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandHandler = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const inventory_service_1 = require("../application/inventory.service");
const dataMapper_1 = require("../infrastructure/mappers/dataMapper");
let CommandHandler = class CommandHandler {
    inventoryService;
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
    }
    async handleNewStock(payload) {
        const data = typeof payload === 'string' ? payload : payload?.data ? payload.data.toString() : payload;
        const productObj = JSON.parse(data);
        const productDTO = {
            id: productObj.id,
            name: productObj.name,
            unitPrice: productObj.unitPrice,
            quantity: productObj.quantity,
            minThres: productObj.minThres,
            maxThres: productObj.maxThres
        };
        const product = dataMapper_1.DataMapper.toDomainProduct(productDTO);
        return this.inventoryService.addProduct(product);
    }
    async handleRemoveStock(payload) {
        const data = typeof payload === 'string'
            ? payload
            : payload?.data
                ? payload.data.toString()
                : payload;
        const productObj = JSON.parse(data);
        const productIdDTO = {
            id: productObj.id
        };
        const productId = dataMapper_1.DataMapper.toDomainProductId(productIdDTO);
        return this.inventoryService.removeProduct(productId);
    }
    async handleEditStock(payload) {
        const data = typeof payload === 'string'
            ? payload
            : payload?.data
                ? payload.data.toString()
                : payload;
        const productObj = JSON.parse(data);
        const productDTO = {
            id: productObj.id,
            name: productObj.name,
            unitPrice: productObj.unitPrice,
            quantity: productObj.quantity,
            minThres: productObj.minThres,
            maxThres: productObj.maxThres
        };
        const product = dataMapper_1.DataMapper.toDomainProduct(productDTO);
        console.log(product);
        return this.inventoryService.editProduct(product);
    }
    async handleGetProduct(payload) {
        const data = typeof payload === 'string'
            ? payload
            : payload?.data
                ? payload.data.toString()
                : payload;
        let productIdObj;
        try {
            productIdObj = JSON.parse(data);
        }
        catch (err) {
            console.error('[handleGetProduct] JSON parsing error:', err);
            return null;
        }
        const productIdDTO = {
            id: productIdObj.id,
        };
        const productId = dataMapper_1.DataMapper.toDomainProductId(productIdDTO);
        return this.inventoryService.getProduct(productId);
    }
    async handleGetInventory() {
        return this.inventoryService.getInventory();
    }
};
exports.CommandHandler = CommandHandler;
__decorate([
    (0, microservices_1.MessagePattern)(`api.warehouse.1.newStock`),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommandHandler.prototype, "handleNewStock", null);
__decorate([
    (0, microservices_1.MessagePattern)(`api.warehouse.1.removeStock`),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommandHandler.prototype, "handleRemoveStock", null);
__decorate([
    (0, microservices_1.MessagePattern)(`api.warehouse.1.editStock`),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommandHandler.prototype, "handleEditStock", null);
__decorate([
    (0, microservices_1.MessagePattern)(`api.warehouse.${process.env.WAREHOUSE_ID}.getProduct`),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommandHandler.prototype, "handleGetProduct", null);
__decorate([
    (0, microservices_1.MessagePattern)(`api.warehouse.${process.env.WAREHOUSE_ID}.getInventory`),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CommandHandler.prototype, "handleGetInventory", null);
exports.CommandHandler = CommandHandler = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [inventory_service_1.InventoryService])
], CommandHandler);
//# sourceMappingURL=commandHandler.controller.js.map