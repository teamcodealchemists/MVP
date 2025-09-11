import { Injectable } from '@nestjs/common';
import { InventoryAggregated } from 'src/domain/inventory-aggregated.entity';
import { GetAllProductsUseCase } from 'src/domain/ports/inbound/getAllProductsUseCase.port';
import { GetAllUseCase } from 'src/domain/ports/inbound/getAllUseCase.port';
import { SyncAddedStockEvent } from 'src/domain/ports/inbound/syncAddedStockEvent.port';
import { SyncEditedStockEvent } from 'src/domain/ports/inbound/syncEditedStockEvent.port';
import { SyncRemovedStockEvent } from 'src/domain/ports/inbound/syncRemovedStockEvent.port';
import { SyncProductDTO } from '../../interfaces/dto/syncProduct.dto';
import { SyncProductIdDTO } from '../../interfaces/dto/syncProductId.dto';
import { SyncWarehouseIdDTO } from '../../interfaces/dto/syncWarehouseId.dto';
import { CloudDataMapper } from '../mappers/cloud-data.mapper';
import { InventoryAggregatedService } from './../../application/inventory-aggregated.service';
import { GetStockUseCase } from 'src/domain/ports/inbound/getStockUseCase.port';
import { SyncInventoryDTO } from 'src/interfaces/dto/syncInventory.dto';

@Injectable()
export class CloudInventoryEventAdapter implements 
  SyncEditedStockEvent,
  SyncRemovedStockEvent,
  SyncAddedStockEvent,
  GetAllUseCase,
  GetAllProductsUseCase,
  GetStockUseCase{

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

  async syncRemovedStock(idDto: SyncProductIdDTO, warehouseIdDto: SyncWarehouseIdDTO): Promise<void> {
    return Promise.resolve(await this.InventoryAggregatedService.removeProduct(this.CloudDataMapper.toDomainProductId(idDto), this.CloudDataMapper.toDomainWarehouseId(warehouseIdDto)));
  }

  async getAll(): Promise<SyncInventoryDTO> {
    const inventory = await this.InventoryAggregatedService.getAll();
    return Promise.resolve(this.CloudDataMapper.toDTOInventoryAggregated(inventory));
  }

  async getAllProducts(): Promise<SyncInventoryDTO> {
    const inventory = await this.InventoryAggregatedService.getAllProducts();
    return Promise.resolve(this.CloudDataMapper.toDTOInventoryAggregated(inventory));
  }

  async getProduct(id: SyncProductIdDTO, warehouseId: SyncWarehouseIdDTO): Promise<SyncProductDTO | null> {
    const product = await this.InventoryAggregatedService.getProduct(
      this.CloudDataMapper.toDomainProductId(id),
      this.CloudDataMapper.toDomainWarehouseId(warehouseId)
    );
    return product ? this.CloudDataMapper.toDTOProduct(product) : null;
  }

  async getProductAggregated(id: SyncProductIdDTO): Promise<SyncProductDTO | null> {
    const product = await this.InventoryAggregatedService.getProductAggregated(
      this.CloudDataMapper.toDomainProductId(id)
    );
    return product ? this.CloudDataMapper.toDTOProduct(product) : null;
  }

}