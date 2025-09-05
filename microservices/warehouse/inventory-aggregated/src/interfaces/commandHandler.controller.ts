import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { InventoryAggregatedService } from '../application/inventory-aggregated.service';
import { SyncProductDTO } from './dto/syncProduct.dto';
import { SyncProductIdDTO } from './dto/syncProductId.dto';
import { SyncInventoryDTO } from './dto/syncInventory.dto';
import { CloudDataMapper } from '../infrastructure/mappers/cloud-data.mapper';
import { CloudInventoryEventAdapter } from 'src/infrastructure/adapters/inventory-aggregated-event.adapter';
@Controller()
export class commandHandler {
  constructor(private readonly cloudInventoryEventAdapter : CloudInventoryEventAdapter
  ) {}

  @MessagePattern('warehouse.stock.added')
  async syncAddedStock(payload: any): Promise<void> {
    console.log(payload);
    const dto: SyncProductDTO = typeof payload === 'string' ? JSON.parse(payload) : payload;
    await this.inventoryService.addProduct(dto);
  }

  @MessagePattern('warehouse.stock.removed')
  async syncRemovedStock(payload: any): Promise<void> {
    console.log(payload);
    const dto: SyncProductIdDTO = typeof payload === 'string' ? JSON.parse(payload) : payload;
    await this.inventoryService.removeProduct(dto.id);
  }


  @MessagePattern('warehouse.stock.updated')
  async syncEditedStock(payload: any): Promise<void> {
    console.log(payload);
    const dto: SyncProductDTO = typeof payload === 'string' ? JSON.parse(payload) : payload;
    await this.inventoryService.updateProduct(dto);
  }

  @MessagePattern('getAllProducts')
  async getAllProducts(): Promise<SyncInventoryDTO> {
    const products = await this.inventoryService.getAllProducts();
    return { productList: products.map(p => this.mapper.toDTOProduct(p)) };
  }

  // UseCase: ottenere inventario completo (puoi adattarlo se differisce da getAllProducts)
  @MessagePattern('getAll')
  async getAll(): Promise<SyncInventoryDTO> {
    const products = await this.inventoryService.getAllProducts();
    return { productList: products.map(p => this.mapper.toDTOProduct(p)) };
  }
}
