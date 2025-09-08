import { Inventory } from 'src/domain/inventory.entity';
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { WarehouseId } from '../domain/warehouseId.entity';
import { Product } from 'src/domain/product.entity';
import { ProductId } from 'src/domain/productId.entity';
import { InventoryRepository } from 'src/domain/inventory.repository';
import {ProductQuantity} from 'src/domain/productQuantity.entity';

@Injectable()
export class InventoryService {
  private readonly warehouseId: WarehouseId;

  constructor(
    @Inject('INVENTORYREPOSITORY')
    private readonly inventoryRepository: InventoryRepository,
  ) {
    this.warehouseId = new WarehouseId(`${process.env.WAREHOUSE_ID}`);
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

 
  async checkProductExistence(id: ProductId): Promise<boolean> {
    const product = await this.inventoryRepository.getById(id);
    return !!product;
  }

  async checkProductThres(product: Product): Promise<boolean> {
    return (
      product.getQuantity() >= product.getMinThres() &&
      product.getQuantity() <= product.getMaxThres()
    );
  }

  async checkProductAvailability(productQuantities: ProductQuantity[]): Promise<boolean> {
    for (const pq of productQuantities) {
      const product = await this.inventoryRepository.getById(pq.getId());
      if (!product) return false;
      if (product.getQuantity() < pq.getQuantity()) return false;
    }
    return true;
  }
}
