"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataMapper = void 0;
const product_entity_1 = require("../../domain/product.entity");
const productId_entity_1 = require("../../domain/productId.entity");
const inventory_entity_1 = require("../../domain/inventory.entity");
exports.DataMapper = {
    toDomainProductId(productIdDTO) {
        return new productId_entity_1.ProductId(productIdDTO.id);
    },
    toDomainProduct(productDTO) {
        return new product_entity_1.Product(new productId_entity_1.ProductId(productDTO.id), productDTO.name, productDTO.unitPrice, productDTO.quantity, productDTO.minThres, productDTO.maxThres);
    },
    toDomainInventory(inventoryDTO) {
        const products = inventoryDTO.productList.map(exports.DataMapper.toDomainProduct);
        return new inventory_entity_1.Inventory(products);
    },
    toDtoProduct(product) {
        return {
            id: product.getId().getId(),
            name: product.getName(),
            unitPrice: product.getUnitPrice(),
            quantity: product.getQuantity(),
            minThres: product.getMinThres(),
            maxThres: product.getMaxThres(),
        };
    },
    toDTOProductId(productId) {
        return {
            id: productId.getId(),
        };
    },
    toDtoInventory(inventory) {
        return {
            productList: inventory.getInventory().map(exports.DataMapper.toDtoProduct),
        };
    },
    toDTO(warehouseId) {
        return {
            warehouseId: parseInt(warehouseId.getId(), 10),
        };
    },
    toBelowMinDTO(product) {
        return {
            id: product.getId().getId(),
            quantity: product.getQuantity(),
            minThres: product.getMinThres(),
        };
    },
    toAboveMaxDTO(product) {
        return {
            id: product.getId().getId(),
            quantity: product.getQuantity(),
            maxThres: product.getMaxThres(),
        };
    },
    toDTOProductQuantity(productId, quantity) {
        return {
            productId: { id: productId.getId() },
            quantity: quantity,
        };
    },
};
//# sourceMappingURL=dataMapper.js.map