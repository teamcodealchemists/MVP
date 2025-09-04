import { Inventory } from 'src/domain/inventory.entity';
import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { WarehouseId } from '../domain/warehouseId.entity';
import { Product } from 'src/domain/product.entity';
import { ProductId } from 'src/domain/productId.entity';
import { InventoryRepository } from 'src/domain/inventory.repository';
import {ProductQuantity} from 'src/domain/productQuantity.entity';
import { OutboundEventAdapter } from 'src/infrastructure/adapters/outbound-event.adapter';

const logger = new Logger('InventoryService');

@Injectable()
export class InventoryService {
  private readonly warehouseId: WarehouseId;
  constructor(
    @Inject('INVENTORYREPOSITORY')
    private readonly inventoryRepository: InventoryRepository,
    private readonly natsAdapter: OutboundEventAdapter,
  ) {
    this.warehouseId = new WarehouseId(Number(`${process.env.WAREHOUSE_ID}`));
  }

  async addProduct(newProduct: Product): Promise<void> {
    await this.inventoryRepository.addProduct(newProduct);
     console.log('Publishing stockAdded event', newProduct);
    //this.natsAdapter.stockAdded(newProduct, this.warehouseId.getId());
     console.log('pUBBLICATO stockAdded event');
  }

  async removeProduct(id: ProductId): Promise<boolean> {
    return await this.inventoryRepository.removeById(id);
    //this.natsAdapter.stockRemoved(id.getId(), this.warehouseId.getId());
  }

  async editProduct(editedProduct: Product): Promise<void> {
    await this.inventoryRepository.updateProduct(editedProduct);
    //this.natsAdapter.stockUpdated(editedProduct, this.warehouseId.getId());
    //Implementare l'outbound adapter per l'edit
    return Promise.resolve();
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

  async getWarehouseId(): Promise<number> {
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

  async addProductQuantity(productQuantity: ProductQuantity): Promise<void> {
    const product = await this.inventoryRepository.getById(productQuantity.getId());
    if (!product) {
      logger.warn(`Product with id ${productQuantity.getId().getId()} not found`);
      throw new NotFoundException(`Product with id ${productQuantity.getId().getId()} not found`);
    }
    product.setQuantity(product.getQuantity() + productQuantity.getQuantity());
    await this.inventoryRepository.updateProduct(product);
    return Promise.resolve();
  }
}
