import { Injectable, Inject } from '@nestjs/common';
import { InventoryAggregatedRepository } from 'src/domain/inventory-aggregated.repository';
import { Product } from '../domain/product.entity';
import { CloudDataMapper } from '../infrastructure/mappers/cloud-data.mapper';
import { InventoryAggregated } from 'src/domain/inventory-aggregated.entity';
import { ProductId } from 'src/domain/productId.entity';


@Injectable()
export class InventoryAggregatedService {
  constructor(
    @Inject('INVENTORYREPOSITORY')
    private readonly repository: InventoryAggregatedRepository
  ) {}

  async addProduct(product: Product): Promise<void> {
    return await this.repository.addProduct(product);
  }

  async updateProduct(product: Product): Promise<void> {
    return await this.repository.updateProduct(product);
  }

  async removeProduct(id: ProductId): Promise<void> {
    return await this.repository.removeById(id);
  }

  async getProductById(id: ProductId): Promise<Product | null> {
    return await this.repository.getById(id);
  }

  async getAllProducts(): Promise<InventoryAggregated> {
    return await this.repository.getAllProducts();
  }

  async getAll(): Promise<InventoryAggregated> {
    return await this.repository.getAll();
  }
}