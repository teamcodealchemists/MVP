import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { SyncProductDTO } from './dto/syncProduct.dto';
import { SyncProductIdDTO } from './dto/syncProductId.dto';
import { CloudInventoryEventAdapter } from 'src/infrastructure/adapters/inventory-aggregated-event.adapter';
import { validateOrReject } from 'class-validator';
import { SyncWarehouseIdDTO } from './dto/syncWarehouseId.dto';
@Controller()
export class CommandHandler {
  constructor(private readonly cloudInventoryEventAdapter : CloudInventoryEventAdapter
  ) {}

  @EventPattern('inventory.stock.added')
  async syncAddedStock(@Payload() payload: any): Promise<void> {
    const dto = payload.product;

    const warehouseIdDTO = new SyncWarehouseIdDTO();
    warehouseIdDTO.warehouseId = dto.warehouseId.warehouseId;
    const productIdDTO = new SyncProductIdDTO();
    productIdDTO.id = dto.id.id;
    const syncDTO = new SyncProductDTO();

    syncDTO.id = productIdDTO;
    syncDTO.name = dto.name;
    syncDTO.unitPrice = dto.unitPrice;
    syncDTO.quantity = dto.quantity;
    syncDTO.quantityReserved = dto.quantityReserved || 0;
    syncDTO.minThres = dto.minThres;
    syncDTO.maxThres = dto.maxThres;
    syncDTO.warehouseId = warehouseIdDTO;

    await validateOrReject(syncDTO);
    await this.cloudInventoryEventAdapter.syncAddedStock(syncDTO);
  }

  @EventPattern('inventory.stock.removed')
  async syncRemovedStock(@Payload() payload: any): Promise<void> {
    const warehouseid = payload.warehouseId;
    const productid = payload.productId;

    const dto = new SyncProductIdDTO();
    dto.id = productid.id;
    const warehouseDto = new SyncWarehouseIdDTO();
    warehouseDto.warehouseId = warehouseid.warehouseId;

    await validateOrReject(dto);
    await validateOrReject(warehouseDto);

    await this.cloudInventoryEventAdapter.syncRemovedStock(dto, warehouseDto);
  }


  @EventPattern('inventory.stock.updated')
  async syncEditedStock(@Payload() payload: any): Promise<void> {
    const dto = payload.product;

    const warehouseIdDTO = new SyncWarehouseIdDTO();
    warehouseIdDTO.warehouseId = dto.warehouseId.warehouseId;
    const productIdDTO = new SyncProductIdDTO();
    productIdDTO.id = dto.id.id;
    const syncDTO = new SyncProductDTO();

    syncDTO.id = productIdDTO;
    syncDTO.name = dto.name;
    syncDTO.unitPrice = dto.unitPrice;
    syncDTO.quantity = dto.quantity;
    syncDTO.quantityReserved = dto.quantityReserved || 0;
    syncDTO.minThres = dto.minThres;
    syncDTO.maxThres = dto.maxThres;
    syncDTO.warehouseId = warehouseIdDTO;

    await this.cloudInventoryEventAdapter.syncEditedStock(syncDTO);
  }


  // --------------------------------------
  //                GETTERS
  // --------------------------------------

  @MessagePattern('get.aggregatedWarehouses.stock.*')
  async getProductAggregated(@Ctx() context: any): Promise<string> {
    try {
      const pattern = context.getSubject(); // fallback if pattern is not present
      const id = new SyncProductIdDTO();
      id.id = pattern.split('.').pop() || '';
      await validateOrReject(id);
      const product = await this.cloudInventoryEventAdapter.getProductAggregated(id);
      if (!product) {
        return JSON.stringify({ error: { code: 'system.notFound', message: 'Product not found' }, meta: {status: 404} });
      }
      return JSON.stringify({ result: { model: {
        id: product.id.id,
        name: product.name,
        unitPrice: product.unitPrice,
        quantity: product.quantity,
        quantityReserved: product.quantityReserved,
        minThres: product.minThres,
        maxThres: product.maxThres,
        warehouseId: product.warehouseId.warehouseId,
      } } });
    } catch (error) {
      return this.errorHandler(error);
    }
  }

  @MessagePattern('get.aggregatedWarehouses.warehouse.*.stock.*')
  async getProduct(@Ctx() context: any): Promise<string> {
    try {
      const patternParts = (context.getSubject()).split('.');
      const warehouseId = new SyncWarehouseIdDTO();
      warehouseId.warehouseId = Number(patternParts[3]);
      const productId = new SyncProductIdDTO();
      productId.id = patternParts[5];
      await validateOrReject(warehouseId);
      await validateOrReject(productId);
      const product = await this.cloudInventoryEventAdapter.getProduct(productId, warehouseId);
      if (!product) {
        return JSON.stringify({ error: { code: 'system.notFound', message: 'Product not found' }, meta: {status: 404} });
      }
      return JSON.stringify({ result: { model: {
        id: product.id.id,
        name: product.name,
        unitPrice: product.unitPrice,
        quantity: product.quantity,
        quantityReserved: product.quantityReserved,
        minThres: product.minThres,
        maxThres: product.maxThres,
        warehouseId: product.warehouseId.warehouseId,
      } } });
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
