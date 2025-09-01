import { Injectable, Inject } from '@nestjs/common';
import { InventoryAggregatedRepository } from 'src/domain/inventory-aggregated.repository';
import { SyncProductDTO } from '../interfaces/dto/syncProduct.dto';
import { Product } from '../domain/product.entity';
import { CloudDataMapper } from '../infrastructure/mappers/cloud-data.mapper';

@Injectable()
export class InventoryAggregatedService {
  constructor(
    @Inject('INVENTORYREPOSITORY')
    private readonly repository: InventoryAggregatedRepository,
    private readonly mapper: CloudDataMapper,
  ) {}

  async addProduct(dto: SyncProductDTO): Promise<void> {
    const product = this.mapper.toDomainProduct(dto);
    return this.repository.addProduct(product);
  }

  async updateProduct(dto: SyncProductDTO): Promise<void> {
    const product = this.mapper.toDomainProduct(dto);
    return this.repository.updateProduct(dto.id, product);
  }

  async removeProduct(id: string): Promise<boolean> {
    return this.repository.removeById(id);
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.repository.getById(id);
  }

  async getAllProducts(): Promise<Product[]> {
    return this.repository.getAllProducts();
  }
}
