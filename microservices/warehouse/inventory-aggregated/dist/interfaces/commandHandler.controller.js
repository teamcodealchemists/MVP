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
exports.commandHandler = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const inventory_aggregated_service_1 = require("../application/inventory-aggregated.service");
const cloud_data_mapper_1 = require("../infrastructure/mappers/cloud-data.mapper");
let commandHandler = class commandHandler {
    constructor(inventoryService, mapper) {
        this.inventoryService = inventoryService;
        this.mapper = mapper;
    }
    //DA MODIFCARE I MESSAGE PATTERN
    async syncAddedStock(payload) {
        console.log(payload);
        console.log("ARRIVATOOO");
        const dto = typeof payload === 'string' ? JSON.parse(payload) : payload;
        await this.inventoryService.addProduct(dto);
    }
    async syncRemovedStock(payload) {
        console.log(payload);
        const dto = typeof payload === 'string' ? JSON.parse(payload) : payload;
        await this.inventoryService.removeProduct(dto.id);
    }
    async syncEditedStock(payload) {
        console.log(payload);
        const dto = typeof payload === 'string' ? JSON.parse(payload) : payload;
        await this.inventoryService.updateProduct(dto);
    }
    async getAllProducts() {
        const products = await this.inventoryService.getAllProducts();
        return { productList: products.map(p => this.mapper.toDTOProduct(p)) };
    }
    // UseCase: ottenere inventario completo (puoi adattarlo se differisce da getAllProducts)
    async getAll() {
        const products = await this.inventoryService.getAllProducts();
        return { productList: products.map(p => this.mapper.toDTOProduct(p)) };
    }
};
exports.commandHandler = commandHandler;
__decorate([
    (0, microservices_1.MessagePattern)(`prova`),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], commandHandler.prototype, "syncAddedStock", null);
__decorate([
    (0, microservices_1.MessagePattern)('warehouse.stock.removed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], commandHandler.prototype, "syncRemovedStock", null);
__decorate([
    (0, microservices_1.MessagePattern)('warehouse.stock.updated'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], commandHandler.prototype, "syncEditedStock", null);
__decorate([
    (0, microservices_1.MessagePattern)('getAllProducts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], commandHandler.prototype, "getAllProducts", null);
__decorate([
    (0, microservices_1.MessagePattern)('getAll'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], commandHandler.prototype, "getAll", null);
exports.commandHandler = commandHandler = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [inventory_aggregated_service_1.InventoryAggregatedService,
        cloud_data_mapper_1.CloudDataMapper])
], commandHandler);
