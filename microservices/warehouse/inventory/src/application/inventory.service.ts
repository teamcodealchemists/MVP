import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { WarehouseId } from '../domain/warehouseId.entity';
import { Product } from 'src/domain/product.entity';
import { ProductId } from 'src/domain/productId.entity';
import { InventoryRepository } from 'src/domain/inventory.repository';

@Injectable()
export class Inventory {
    constructor(
        private warehouseId: WarehouseId,
        @Inject('InventoryRepository') private readonly inventoryRepository: InventoryRepository,
            // Da valutare come iniettare correttamente, non è corretto mettere l'adapter nel repository,
            // ma non si può iniettare direttamente così la porta perché non funziona a runtime
    ) {}

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
}