import { Controller, Logger } from '@nestjs/common';
import { Ctx, MessagePattern } from '@nestjs/microservices';
import { ProductDto } from './dto/product.dto';
import { ProductIdDto } from './dto/productId.dto';
import { DataMapper } from '../infrastructure/mappers/dataMapper';
import { Product } from 'src/domain/product.entity';
import { Inventory } from 'src/domain/inventory.entity';
import { InboundEventListener } from 'src/infrastructure/adapters/inbound-event.adapter';
import { validateOrReject } from 'class-validator';


//TODO: Risistemare per RESGATE
// I payload sono assolutamente errati

const logger = new Logger('commandHandler');
@Controller()
export class CommandHandler {
  constructor(private readonly inboundEventListener : InboundEventListener) { }

  @MessagePattern(`call.warehouse.${process.env.WAREHOUSE_ID}.stock.new`)
  async handleNewStock(payload: any): Promise<void> {
    const data = typeof payload === 'string' ? payload : payload?.data ? payload.data.toString() : payload;

    const productObj = JSON.parse(data);

    const productDTO: ProductDto = {
      id: productObj.id,
      name: productObj.name,
      unitPrice: productObj.unitPrice,
      quantity: productObj.quantity,
      quantityReserved: productObj.quantityReserved ?? 0,
      minThres: productObj.minThres,
      maxThres: productObj.maxThres,
      warehouseId: productObj.warehouseId
    };
    try {
      await validateOrReject(productDTO);
      await this.inboundEventListener.newStock(productDTO);
      return Promise.resolve();
    } catch (error) {
      logger.error('Error in handleNewStock:', error);
      return Promise.resolve();
      //return Promise.resolve(JSON.stringify({ error: { code: 'system.internalError', message: error?.message || 'Unknown error' } }));
    }
  }


  @MessagePattern(`call.warehouse.${process.env.WAREHOUSE_ID}.stock.*.delete`)
  async handleRemoveStock(@Ctx() context:any): Promise<void> {

    // Estrae l'ID prodotto dalla subject del messaggio, dove l'asterisco (*) rappresenta l'ID
    const subjectParts = context.getSubject().split('.');
    const itemIdStr = subjectParts[subjectParts.length - 2] ?? null;


    const productIdDTO: ProductIdDto = {
      id: itemIdStr
    };

    try {
      await validateOrReject(productIdDTO);
      await this.inboundEventListener.removeStock(productIdDTO);
      return Promise.resolve();
    } catch (error) {
      logger.error('Error in handleRemoveStock:', error);
      return Promise.resolve();
      //return Promise.resolve(JSON.stringify({ error: { code: 'system.internalError', message: error?.message || 'Unknown error' } }));
    }
  }



  @MessagePattern(`call.warehouse.${process.env.WAREHOUSE_ID}.stock.set`) //call.warehouse.variabile.stock.#stock.set
  //fare @payload
  async handleEditStock(payload: any): Promise<void> {
     
    const data =
      typeof payload === 'string'
        ? payload
        : payload?.data
          ? payload.data.toString()
          : payload;

    const productObj = JSON.parse(data);


    const productDTO: ProductDto = {
      id: productObj.id,
      name: productObj.name,
      unitPrice: productObj.unitPrice,
      quantity: productObj.quantity,
      quantityReserved: productObj.quantityReserved ?? 0,
      minThres: productObj.minThres,
      maxThres: productObj.maxThres,
      warehouseId : productObj.warehouseId
    };
    try {
      await validateOrReject(productDTO);
      await this.inboundEventListener.editStock(productDTO);
      return Promise.resolve();
    } catch (error) {
      logger.error('Error in handleEditStock:', error);
      return Promise.resolve();
      //return Promise.resolve(JSON.stringify({ error: { code: 'system.internalError', message: error?.message || 'Unknown error' } }));
    }
  }



  @MessagePattern(`get.warehouse.${process.env.WAREHOUSE_ID}.stock.*`)
  async handleGetProduct(@Ctx() context:any): Promise<string> {

    // Estrae l'ID prodotto dalla subject del messaggio, dove l'asterisco (*) rappresenta l'ID
    const itemIdStr = context.getSubject().split('.').pop();

    const productIdDTO: ProductIdDto = new ProductIdDto();
    productIdDTO.id = itemIdStr;

    try {
      await validateOrReject(productIdDTO);
      //return Promise.resolve(await this.inboundEventListener.handleGetProduct(productIdDTO));
      return Promise.resolve(JSON.stringify({ result: { model: productIdDTO}}));
    } catch (error) {
      logger.error('Error in handleGetProduct:', error);
      //return Promise.resolve(null);
      return Promise.resolve(JSON.stringify({ error: { code: 'system.internalError', message: Array.isArray(error) ? error.map(e => e.toString()).join(', ') : error?.message || 'Unknown error' } }));
    }
  }



  @MessagePattern(`get.warehouse.${process.env.WAREHOUSE_ID}.inventory`)
  async handleGetInventory(): Promise<Inventory> {
    return Promise.resolve(await this.inboundEventListener.getInventory());
  }

}

