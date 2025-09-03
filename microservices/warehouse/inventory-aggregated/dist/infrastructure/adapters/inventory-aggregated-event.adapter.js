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
exports.CloudInventoryEventAdapter = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
let CloudInventoryEventAdapter = class CloudInventoryEventAdapter {
    constructor() {
        this.client = microservices_1.ClientProxyFactory.create({
            transport: microservices_1.Transport.NATS,
            options: {
                url: 'nats://localhost:4222',
            },
        });
    }
    // Stock Added Port
    stockAdded(dto) {
        this.client.emit('stock.added', dto);
    }
    // Stock Removed Port
    stockRemoved(productId, warehouseId) {
        this.client.emit('stock.removed', { productId, warehouseId });
    }
    // Stock Updated Port
    stockUpdated(dto) {
        this.client.emit('stock.updated', dto);
    }
    publishAll(inventory) {
        this.client.emit('inventory.all', inventory);
    }
    publishAllProducts(inventory) {
        this.client.emit('inventory.allProducts', inventory);
    }
};
exports.CloudInventoryEventAdapter = CloudInventoryEventAdapter;
exports.CloudInventoryEventAdapter = CloudInventoryEventAdapter = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], CloudInventoryEventAdapter);
