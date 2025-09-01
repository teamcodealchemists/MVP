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
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const warehouseId_entity_1 = require("../domain/warehouseId.entity");
const inventory_repository_1 = require("../domain/inventory.repository");
const outbound_event_adapter_1 = require("../infrastructure/adapters/outbound-event.adapter");
let InventoryService = class InventoryService {
    inventoryRepository;
    natsAdapter;
    warehouseId;
    constructor(inventoryRepository, natsAdapter) {
        this.inventoryRepository = inventoryRepository;
        this.natsAdapter = natsAdapter;
        this.warehouseId = new warehouseId_entity_1.WarehouseId(`${process.env.WAREHOUSE_ID}`);
    }
    async addProduct(newProduct) {
        await this.inventoryRepository.addProduct(newProduct);
        console.log('Publishing stockAdded event', newProduct);
        this.natsAdapter.stockAdded(newProduct, this.warehouseId.getId());
        console.log('pUBBLICATO stockAdded event');
    }
    async removeProduct(id) {
        return await this.inventoryRepository.removeById(id);
        this.natsAdapter.stockRemoved(id.getId(), this.warehouseId.getId());
    }
    async editProduct(editedProduct) {
        await this.inventoryRepository.updateProduct(editedProduct);
        this.natsAdapter.stockUpdated(editedProduct, this.warehouseId.getId());
    }
    async getProduct(id) {
        const product = await this.inventoryRepository.getById(id);
        if (!product) {
            throw new common_1.NotFoundException(`Product with id ${id.getId()} not found`);
        }
        return product;
    }
    async getInventory() {
        return await this.inventoryRepository.getAllProducts();
    }
    async getWarehouseId() {
        return this.warehouseId.getId();
    }
    async checkProductExistence(id) {
        const product = await this.inventoryRepository.getById(id);
        return !!product;
    }
    async checkProductThres(product) {
        return (product.getQuantity() >= product.getMinThres() &&
            product.getQuantity() <= product.getMaxThres());
    }
    async checkProductAvailability(productQuantities) {
        for (const pq of productQuantities) {
            const product = await this.inventoryRepository.getById(pq.getId());
            if (!product)
                return false;
            if (product.getQuantity() < pq.getQuantity())
                return false;
        }
        return true;
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('INVENTORYREPOSITORY')),
    __metadata("design:paramtypes", [Object, outbound_event_adapter_1.OutboundEventAdapter])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map