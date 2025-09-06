import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { InventoryAggregatedService } from '../application/inventory-aggregated.service';
import { SyncProductDTO } from './dto/syncProduct.dto';
import { SyncProductIdDTO } from './dto/syncProductId.dto';
import { SyncInventoryDTO } from './dto/syncInventory.dto';
import { CloudDataMapper } from '../infrastructure/mappers/cloud-data.mapper';
import { CloudInventoryEventAdapter } from 'src/infrastructure/adapters/inventory-aggregated-event.adapter';
import { InventoryAggregated } from 'src/domain/inventory-aggregated.entity';
@Controller()
export class commandHandler {
  constructor(private readonly cloudInventoryEventAdapter : CloudInventoryEventAdapter
  ) {}

  @MessagePattern('warehouse.stock.added')
  async syncAddedStock(payload: any): Promise<void> {
    console.log(payload);
    const dto: SyncProductDTO = typeof payload === 'string' ? JSON.parse(payload) : payload;
    await this.cloudInventoryEventAdapter.syncAddedStock(dto);
  }

  @MessagePattern('warehouse.stock.removed')
  async syncRemovedStock(payload: any): Promise<void> {
    console.log(payload);
    const dto: SyncProductIdDTO = typeof payload === 'string' ? JSON.parse(payload) : payload;
    await this.cloudInventoryEventAdapter.syncRemovedStock(dto);
  }


  @MessagePattern('warehouse.stock.updated')
  async syncEditedStock(payload: any): Promise<void> {
    console.log(payload);
    const dto: SyncProductDTO = typeof payload === 'string' ? JSON.parse(payload) : payload;
    await this.cloudInventoryEventAdapter.syncEditedStock(dto);
  }

  @MessagePattern('get.aggregatedWarehouses.allProducts')
  async getAllProducts(): Promise<string> {
    const products = await this.cloudInventoryEventAdapter.getAllProducts();
    return { productList: products.map(p => this.mapper.toDTOProduct(p)) };
  }

  // UseCase: ottenere inventario completo (puoi adattarlo se differisce da getAllProducts)
  @MessagePattern('get.aggregatedWarehouses.all')
  async getAll(): Promise<string> {
    try {
      const products = await this.cloudInventoryEventAdapter.getAllProducts();
      return { productList: products.map(p => this.mapper.toDTOProduct(p)) };
    } catch (error) {
      return this.errorHandler(error);
    }
  }

  private async errorHandler(error: any): Promise<string> {
    let message: string;
      if (Array.isArray(error)) {
        // class-validator errors: estrai i messaggi di constraint
        message = error
          .map(e => Object.values(e.constraints ?? {}).join(', '))
          .filter(Boolean)
          .join('; ');

        return Promise.resolve(JSON.stringify({ error: { code: 'system.invalidParams', message } }));
      } else {
        return Promise.resolve(JSON.stringify({ error: { code: 'system.internalError', message: error?.message || 'Unknown error' }, meta: {status: 404} }));
      }
  }
}
