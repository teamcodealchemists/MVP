import { Inventory } from 'src/domain/inventory.entity';
import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { WarehouseId } from '../domain/warehouseId.entity';
import { Product } from 'src/domain/product.entity';
import { ProductId } from 'src/domain/productId.entity';
import { InventoryRepository } from 'src/domain/inventory.repository';
import { ProductQuantity } from 'src/domain/productQuantity.entity';
import { OutboundEventAdapter } from 'src/infrastructure/adapters/outbound-event.adapter';
import { OrderId } from 'src/domain/orderId.entity';

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

  // ---------------------------------------
  //        Command Handler Methods
  // ---------------------------------------

  async addProduct(newProduct: Product): Promise<void> {
    if (await this.inventoryRepository.getById(newProduct.getId()) == null) {
      {
        await this.inventoryRepository.addProduct(newProduct);
        console.log('Publishing stockAdded event', newProduct);
        this.natsAdapter.stockAdded(newProduct, this.warehouseId);
        console.log('PUBBLICATO stockAdded event');
        return Promise.resolve();
      }
    } else {
      throw new Error(`Product with id ${newProduct.getId().getId()} already exists`);
    }
  }

  async removeProduct(id: ProductId): Promise<boolean> {
    if (await this.inventoryRepository.getById(id) == null) {
      throw new NotFoundException(`Product with id ${id.getId()} not found`);
    }
    await this.inventoryRepository.removeById(id);
    await this.natsAdapter.stockRemoved(id, this.warehouseId);
    return true;
  }

  async editProduct(editedProduct: Product): Promise<void> {
    const existingProduct = await this.inventoryRepository.getById(editedProduct.getId());
    if (!existingProduct) {
      throw new NotFoundException(`Product with id ${editedProduct.getId().getId()} not found`);
    }
    await this.inventoryRepository.updateProduct(editedProduct);
    this.natsAdapter.stockUpdated(editedProduct, this.warehouseId);
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

  // ---------------------------------------
  //        Listener Event Methods
  // ---------------------------------------


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

  async checkProductAvailability(orderId: OrderId, productQuantities: ProductQuantity[]): Promise<boolean> {
    for (const pq of productQuantities) {
      const product = await this.inventoryRepository.getById(pq.getId());
      if (!product || product.getQuantity() < pq.getQuantity()) {
        this.natsAdapter.reservedQuantities(orderId, productQuantities);
        return false;
      }
    }
    this.natsAdapter.sufficientProductAvailability(orderId);
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

  async shipOrder(order : OrderId, productQ :  ProductQuantity[]): Promise<void>{
    for (const pq of productQ) {
      const product = await this.inventoryRepository.getById(pq.getId());
      if (!product) {
        console.warn(`Prodotto con id ${pq.getId().getId()} non trovato per l'ordine ${order}`);
        continue;
      }
      const newReserved = Math.max((product.getQuantityReserved() || 0) - pq.getQuantity(), 0);
      const updatedProduct = new Product(
        product.getId(),
        product.getName(),
        product.getUnitPrice(),
        product.getQuantity(),
        newReserved,
        product.getMinThres(),
        product.getMaxThres()
      );
      await this.inventoryRepository.updateProduct(updatedProduct);
    }
    await this.natsAdapter.stockShipped(order);
    return Promise.resolve();
  }
  async reserveStock(order : OrderId, productQ :  ProductQuantity[]): Promise<void>{
      const reserved: ProductQuantity[] = [];
      let allSufficient = true;
      for (const pq of productQ) {
        const product = await this.inventoryRepository.getById(pq.getId());
        if (!product) {
          allSufficient = false;
          continue;
        }
        if (product.getQuantity() >= pq.getQuantity()) {
          console.log("c'è abbastanza prodotto per questo go go");
        } else {
          allSufficient = false;
          const newReserved = pq.getQuantity();
          const p = new Product(new ProductId(pq.getId().getId()), product.getName(), product.getUnitPrice(), 0,
                                newReserved, product.getMinThres(), product.getMaxThres());
          const p1 = new ProductQuantity(new ProductId(product.getId().getId()), newReserved);
          if(product.getMinThres() > 0) this.natsAdapter.belowMinThres(p,this.warehouseId);
          reserved.push(p1);
          await this.inventoryRepository.updateProduct(p);
        }
      }
      if (allSufficient) {
        const reserved: ProductQuantity[] = [];
        for (const pq of productQ) {
          const product = await this.inventoryRepository.getById(pq.getId());
          if (!product) continue;
          const newQuantity = product.getQuantity() - pq.getQuantity();
          const newReserved = (product.getQuantityReserved() || 0) + pq.getQuantity();
          const updatedProduct = new Product(
            product.getId(),
            product.getName(),
            product.getUnitPrice(),
            newQuantity,
            newReserved,
            product.getMinThres(),
            product.getMaxThres()
          );
          if(product.getMinThres() > newQuantity) this.natsAdapter.belowMinThres(updatedProduct,this.warehouseId);
          await this.inventoryRepository.updateProduct(updatedProduct);
          reserved.push(new ProductQuantity(product.getId(), pq.getQuantity()));
        }
        await this.natsAdapter.sufficientProductAvailability(order);
      } else {
        await this.natsAdapter.reservedQuantities(order, reserved);
      }
    return Promise.resolve();
  }
  async receiveStock(order : OrderId, productQ :  ProductQuantity[]): Promise<void>{
    for (const pq of productQ) {
      const product = await this.inventoryRepository.getById(pq.getId());
      if (!product) {
        continue;
      }
      const newQuantity = pq.getQuantity() + product.getQuantity();
      if(product.getMaxThres() > newQuantity){
        const p = new Product(new ProductId(product.getId().getId()), product.getName(), product.getUnitPrice(), newQuantity,
        product.getQuantityReserved(), product.getMinThres(), product.getMaxThres());
        await this.inventoryRepository.updateProduct(p);
      }else{
        const p = new Product(new ProductId(product.getId().getId()), product.getName(), product.getUnitPrice(), newQuantity,
        product.getQuantityReserved(), product.getMinThres(), product.getMaxThres());
        this.natsAdapter.aboveMaxThres(p,this.warehouseId);
      }
    }
    this.natsAdapter.stockReceived(order);
    return Promise.resolve();
  }
}
