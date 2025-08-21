import { Inventory } from 'src/domain/inventory.entity';
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { WarehouseId } from '../domain/warehouseId.entity';
import { Product } from 'src/domain/product.entity';
import { ProductId } from 'src/domain/productId.entity';
import { InventoryRepository } from 'src/domain/inventory.repository';
import {ProductQuantity} from 'src/domain/productQuantity.entity';

@Injectable() // mark class as a provider
export class InventoryService {
  private readonly warehouseId: WarehouseId;
  constructor(
    @Inject('INVENTORYREPOSITORY')
    private readonly inventoryRepository: InventoryRepository,
  ) {
    this.warehouseId = new WarehouseId(`${process.env.WAREHOUSE_ID}`);
  }


  private async checkProductExistence(id: ProductId): Promise<boolean> {
    return this.inventoryRepository.checkProductExistence(id);
  }

  private async checkProductThres(product: Product): Promise<boolean> {
    return this.inventoryRepository.checkProductThres(product);
  }

  async addProduct(newProduct: Product): Promise<void> {
    await this.inventoryRepository.addProduct(newProduct);
  }

  async removeProduct(id: ProductId): Promise<boolean> {
    return await this.inventoryRepository.removeById(id);
  }

  async editProduct(editedProduct: Product): Promise<void> {
    await this.inventoryRepository.updateProduct(editedProduct);
  }

  async getProduct(id: ProductId): Promise<Product> {
    const product = await this.inventoryRepository.getById(id);
    if (!product) {
      throw new NotFoundException(`Product with id ${id.getId()} not found`);
    }
    return product;
  }

  async getInventory(): Promise<Inventory> {
    return await this.inventoryRepository.getAllProducts();
  }


  async getWarehouseId(): Promise<string> {
    return this.warehouseId.getId();
  }

  async checkProductAvailability(productQuantities: ProductQuantity[]): Promise<boolean> {
        return this.inventoryRepository.checkProductAvailability(productQuantities);
    }

  async getHello(): Promise<string> {
    return (await this.inventoryRepository.removeById(new ProductId('1')))
      .valueOf()
      ? 'Hello'
      : 'Goodbye';
  }
}
