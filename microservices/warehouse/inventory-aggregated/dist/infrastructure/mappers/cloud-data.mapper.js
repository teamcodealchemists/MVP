"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudDataMapper = void 0;
const common_1 = require("@nestjs/common");
const product_entity_1 = require("../../domain/product.entity");
const productId_entity_1 = require("../../domain/productId.entity");
const warehouseId_entity_1 = require("../../domain/warehouseId.entity");
const inventory_aggregated_entity_1 = require("../../domain/inventory-aggregated.entity");
let CloudDataMapper = class CloudDataMapper {
    toDomainProduct(syncProductDTO) {
        return new product_entity_1.Product(new productId_entity_1.ProductId(syncProductDTO.id), syncProductDTO.name, syncProductDTO.unitPrice, syncProductDTO.quantity, syncProductDTO.minThres, syncProductDTO.maxThres, new warehouseId_entity_1.WarehouseId(syncProductDTO.warehouseId));
    }
    toDomainproductId(syncProductIdDTO) {
        return new productId_entity_1.ProductId(syncProductIdDTO.id);
    }
    toDomainWarehouseId(syncWarehouseIdDTO) {
        return new warehouseId_entity_1.WarehouseId(syncWarehouseIdDTO.warehouseId.toString());
    }
    toDomainInventoryAggregated(syncInventoryDTO) {
        const products = syncInventoryDTO.productList.map(p => this.toDomainProduct(p));
        return new inventory_aggregated_entity_1.InventoryAggregated(products);
    }
    toDTOProduct(product) {
        return {
            id: product.getId().getId(),
            name: product.getName(),
            unitPrice: product.getUnitPrice(),
            quantity: product.getQuantity(),
            minThres: product.getMinThres(),
            maxThres: product.getMaxThres(),
            warehouseId: product.getWarehouseId(),
        };
    }
    toDTOProductId(productId) {
        return { id: productId.getId() };
    }
    toDTOWarehouseId(warehouseId) {
        return { warehouseId: warehouseId.getId() };
    }
    toDTOInventoryAggregated(inventory) {
        return {
            productList: inventory.getInventory().map(p => this.toDTOProduct(p)),
        };
    }
};
exports.CloudDataMapper = CloudDataMapper;
exports.CloudDataMapper = CloudDataMapper = __decorate([
    (0, common_1.Injectable)()
], CloudDataMapper);
