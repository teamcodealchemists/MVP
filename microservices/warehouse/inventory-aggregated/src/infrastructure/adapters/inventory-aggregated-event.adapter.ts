import { InventoryAggregatedService } from './../../application/inventory-aggregated.service';
import { Injectable } from '@nestjs/common';
import { CloudDataMapper } from '../mappers/cloud-data.mapper';
import { SyncProductDTO } from '../../interfaces/dto/syncProduct.dto';
import { SyncProductIdDTO } from '../../interfaces/dto/syncProductId.dto';
import { SyncWarehouseIdDTO } from '../../interfaces/dto/syncWarehouseId.dto';
import { SyncInventoryDTO } from '../../interfaces/dto/syncInventory.dto';
import { SyncAddedStockEvent } from 'src/domain/ports/inbound/syncAddedStockEvent.port';
import { GetAllProductsUseCase } from 'src/domain/ports/inbound/getAllProductsUseCase.port';
import { GetAllUseCase } from 'src/domain/ports/inbound/getAllUseCase.port';
import { SyncEditedStockEvent } from 'src/domain/ports/inbound/syncEditedStockEvent.port';
import { SyncRemovedStockEvent } from 'src/domain/ports/inbound/syncRemovedStockEvent.port';
import { InventoryAggregated } from 'src/domain/inventory-aggregated.entity';

@Injectable()
export class CloudInventoryEventAdapter implements 
  SyncEditedStockEvent,
  SyncRemovedStockEvent,
  SyncAddedStockEvent,
  GetAllUseCase,
  GetAllProductsUseCase {

    constructor(
        private readonly InventoryAggregatedService: InventoryAggregatedService,
        private readonly CloudDataMapper: CloudDataMapper
    ) {}

  async syncAddedStock(dto: SyncProductDTO): Promise<void> {
    return Promise.resolve(await this.InventoryAggregatedService.addProduct(this.CloudDataMapper.toDomainProduct(dto)));
  }

  async syncEditedStock(dto: SyncProductDTO): Promise<void> {
    return Promise.resolve(await this.InventoryAggregatedService.updateProduct(this.CloudDataMapper.toDomainProduct(dto)));
  }

  async syncRemovedStock(dto: SyncProductIdDTO): Promise<void> {
    return Promise.resolve(await this.InventoryAggregatedService.removeProduct(this.CloudDataMapper.toDomainProductId(dto)));
  }

  async getAll(): Promise<SyncInventoryDTO> {
    const inventory = await this.InventoryAggregatedService.getAll();
    return Promise.resolve(this.CloudDataMapper.toDTOInventoryAggregated(inventory));
  }

  async getAllProducts(): Promise<SyncInventoryDTO> {
    const inventory = await this.InventoryAggregatedService.getAllProducts();
    return Promise.resolve(this.CloudDataMapper.toDTOInventoryAggregated(inventory));
  }
}