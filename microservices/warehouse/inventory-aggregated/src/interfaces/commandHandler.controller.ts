import { Controller } from '@nestjs/common';
import { Ctx, MessagePattern, Payload } from '@nestjs/microservices';
import { SyncProductDTO } from './dto/syncProduct.dto';
import { SyncProductIdDTO } from './dto/syncProductId.dto';
import { CloudInventoryEventAdapter } from 'src/infrastructure/adapters/inventory-aggregated-event.adapter';
import { validateOrReject } from 'class-validator';
import { SyncWarehouseIdDTO } from './dto/syncWarehouseId.dto';
@Controller()
export class commandHandler {
  constructor(private readonly cloudInventoryEventAdapter : CloudInventoryEventAdapter
  ) {}

  @MessagePattern('inventory.stock.added')
  async syncAddedStock(@Payload() dto: SyncProductDTO): Promise<void> {
    console.log(dto);
    await this.cloudInventoryEventAdapter.syncAddedStock(dto);
  }

  @MessagePattern('inventory.stock.removed')
  async syncRemovedStock(@Payload() payload: any): Promise<void> {
    console.log(payload);

    const dto: SyncProductIdDTO = { id: payload.productId };
    const warehouseDto: SyncWarehouseIdDTO = { warehouseId: payload.warehouseId };

    await this.cloudInventoryEventAdapter.syncRemovedStock(dto, warehouseDto);
  }


  @MessagePattern('inventory.stock.updated')
  async syncEditedStock(@Payload() dto: SyncProductDTO): Promise<void> {
    console.log(dto);
    await this.cloudInventoryEventAdapter.syncEditedStock(dto);
  }


  // --------------------------------------
  //                GETTERS
  // --------------------------------------

  @MessagePattern('get.aggregatedWarehouses.stock.*')
  async getProductAggregated(@Ctx() context: any): Promise<string> {
    try {
      const id: SyncProductIdDTO = { id: context.getPattern().split('.').pop() || '' };
      await validateOrReject(id);
      const product = await this.cloudInventoryEventAdapter.getProductAggregated(id);
      return JSON.stringify({ result: { model: product } });
    } catch (error) {
      return this.errorHandler(error);
    }
  }

  @MessagePattern('get.aggregatedWarehouses.warehouse.*.stock.*')
  async getProduct(@Ctx() context: any): Promise<string> {
    try {
      const patternParts = context.getPattern().split('.');
      const warehouseId: SyncWarehouseIdDTO = { warehouseId: patternParts[3] || '' };
      const productId: SyncProductIdDTO = { id: patternParts[5] || '' };
      await validateOrReject(warehouseId);
      await validateOrReject(productId);
      const product = await this.cloudInventoryEventAdapter.getProduct(productId, warehouseId);
      return JSON.stringify({ result: { model: product } });
    }
    catch (error) {
      return this.errorHandler(error);
    }
  }

  @MessagePattern('get.aggregatedWarehouses.allProducts')
  async getAllProducts(): Promise<string> {
    try {
      // Ottieni tutti i prodotti dall'inventario
      const products = (await this.cloudInventoryEventAdapter.getAllProducts()).productList;

      // Mappa ogni prodotto in un riferimento rid
      const collection = products.map(product => ({
      rid: `get.aggregatedWarehouses.warehouse.${product.warehouseId.warehouseId}.stock.${product.id}`
      }));

      return Promise.resolve(JSON.stringify({ result: { collection } }));
    } catch (error) {
      return this.errorHandler(error);
    }
  }

  // UseCase: ottenere inventario completo (puoi adattarlo se differisce da getAllProducts)
  @MessagePattern('get.aggregatedWarehouses.all')
  async getAll(): Promise<string> {
    try {
      // Ottieni tutti i prodotti dall'inventario
      const products = (await this.cloudInventoryEventAdapter.getAll()).productList;

      // Mappa ogni prodotto in un riferimento rid
      const collection = products.map(product => ({
      rid: `get.aggregatedWarehouses.stock.${product.id}`
      }));

      return Promise.resolve(JSON.stringify({ result: { collection } }));
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
