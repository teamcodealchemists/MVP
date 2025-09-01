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
exports.InventoryAggregatedService = void 0;
const common_1 = require("@nestjs/common");
const cloud_data_mapper_1 = require("../infrastructure/mappers/cloud-data.mapper");
let InventoryAggregatedService = class InventoryAggregatedService {
    constructor(repository, mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }
    async addProduct(dto) {
        const product = this.mapper.toDomainProduct(dto);
        return this.repository.addProduct(product);
    }
    async updateProduct(dto) {
        const product = this.mapper.toDomainProduct(dto);
        return this.repository.updateProduct(dto.id, product);
    }
    async removeProduct(id) {
        return this.repository.removeById(id);
    }
    async getProductById(id) {
        return this.repository.getById(id);
    }
    async getAllProducts() {
        return this.repository.getAllProducts();
    }
};
exports.InventoryAggregatedService = InventoryAggregatedService;
exports.InventoryAggregatedService = InventoryAggregatedService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('INVENTORYREPOSITORY')),
    __metadata("design:paramtypes", [Object, cloud_data_mapper_1.CloudDataMapper])
], InventoryAggregatedService);
