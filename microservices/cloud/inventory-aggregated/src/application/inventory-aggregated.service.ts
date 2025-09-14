import { Injectable, Inject } from '@nestjs/common';
import { InventoryAggregatedRepository } from 'src/domain/inventory-aggregated.repository';
import { Product } from '../domain/product.entity';
import { CloudDataMapper } from '../infrastructure/mappers/cloud-data.mapper';
import { InventoryAggregated } from 'src/domain/inventory-aggregated.entity';
import { ProductId } from 'src/domain/productId.entity';
import { WarehouseId } from 'src/domain/warehouseId.entity';
import { TelemetryService } from 'src/telemetry/telemetry.service';


@Injectable()
export class InventoryAggregatedService {
  constructor(
    @Inject('INVENTORYREPOSITORY')
    private readonly repository: InventoryAggregatedRepository,
    private readonly telemetryService: TelemetryService,
  ) {}

  async addProduct(product: Product): Promise<void> {
    this.telemetryService.setInventoryProductsTotal(product.getWarehouseId().getId(), product.getId().getId(), product.getQuantity());
    return await this.repository.addProduct(product);
  }

  async updateProduct(product: Product): Promise<void> {
    this.telemetryService.setInventoryProductsTotal(product.getWarehouseId().getId(), product.getId().getId(), product.getQuantity());
    return await this.repository.updateProduct(product);
  }

  async removeProduct(id: ProductId, warehouseId: WarehouseId): Promise<void> {
    this.telemetryService.setInventoryProductsTotal(warehouseId.getId(), id.getId(), 0);
    return await this.repository.removeProduct(id, warehouseId);
  }

  async getAllProducts(): Promise<InventoryAggregated> {
    return await this.repository.getAllProducts();
  }

  async getAll(): Promise<InventoryAggregated> {
    return await this.repository.getAll();
  }

  async getProduct(id: ProductId, warehouseId: WarehouseId): Promise<Product | null> {
    const product = await this.repository.getProduct(id, warehouseId);
    if (!product) {
      throw new Error('Product not found in the specified warehouse');
    }
    return product;
  }

  async getProductAggregated(id: ProductId): Promise<Product | null> {
    const product = await this.repository.getProductAggregated(id);
    if (!product) {
      throw new Error('Product not found in the specified warehouse');
    }
    return product;
  }

}