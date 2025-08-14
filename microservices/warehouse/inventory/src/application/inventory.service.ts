import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { WarehouseId } from '../domain/warehouseId.entity';
import { Product } from 'src/domain/product.entity';
import { ProductId } from 'src/domain/productId.entity';
import { InventoryRepository } from 'src/domain/inventory.repository';

export class InventoryService {
    private readonly warehouseId: WarehouseId;
    constructor(
        @Inject('INVENTORYREPOSITORY') private readonly inventoryRepository: InventoryRepository,
            // Da valutare come iniettare correttamente, non è corretto mettere l'adapter nel repository,
            // ma non si può iniettare direttamente così la porta perché non funziona a runtime
    ) {
        this.warehouseId = new WarehouseId(`${process.env.WAREHOUSE_ID}`);
    }

/*
    async addProduct(newProduct: Product): Promise<void> {
        this.inventoryRepository.addProduct(newProduct);

    }
    async removeProduct(id: ProductId): Promise<boolean> {
        return this.inventoryRepository.removeById(id);
    }
    async editProduct(editedProduct: Product): Promise<void> {
        this.inventoryRepository.updateProduct(editedProduct);
    }
    async getProduct(id: ProductId): Promise<Product> {
        return this.inventoryRepository.getById(id);
    }
    async (): Promise<> {

    }
    async (): Promise<> {

    }
    async (): Promise<> {

    }    
    */

    async getHello(): Promise<string> {
        return (await this.inventoryRepository.removeById(new ProductId("1"))).valueOf() ? "Hello" : "Goodbye";
    }
}