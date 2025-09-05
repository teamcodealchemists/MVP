import { Controller, Logger } from '@nestjs/common';
import { Ctx, MessagePattern, Payload } from '@nestjs/microservices';
import { ProductDto } from './dto/product.dto';
import { ProductIdDto } from './dto/productId.dto';
import { DataMapper } from '../infrastructure/mappers/dataMapper';
import { Product } from 'src/domain/product.entity';
import { Inventory } from 'src/domain/inventory.entity';
import { InboundEventListener } from 'src/infrastructure/adapters/inbound-event.adapter';
import { validateOrReject } from 'class-validator';
import { log } from 'console';


//TODO: Risistemare per RESGATE
// I payload sono assolutamente errati

const logger = new Logger('commandHandler');
@Controller()
export class CommandHandler {
  constructor(private readonly inboundEventListener: InboundEventListener) { }

  @MessagePattern(`call.warehouse.${process.env.WAREHOUSE_ID}.stock.new`)
  async handleNewStock(@Payload('params') payload: any): Promise<string> {

    const productObj = payload;

    logger.log('Received new stock payload:', productObj);

    const productDTO: ProductDto = new ProductDto();
    productDTO.id = productObj.id;
    productDTO.name = productObj.name;
    productDTO.unitPrice = productObj.unitPrice;
    productDTO.quantity = productObj.quantity;
    productDTO.quantityReserved = productObj.quantityReserved ?? 0;
    productDTO.minThres = productObj.minThres;
    productDTO.maxThres = productObj.maxThres;
    productDTO.warehouseId = productObj.warehouseId ?? process.env.WAREHOUSE_ID;

    try {
      await validateOrReject(productDTO);
      //await this.inboundEventListener.newStock(productDTO);
      let RID = `warehouse.${process.env.WAREHOUSE_ID}.stock.${productDTO.id}`;
      return Promise.resolve(JSON.stringify({ resource: { rid: RID } }));
    } catch (error) {
      logger.error('Error in handleNewStock:', error);
      return await this.errorHandler(error);
    }
  }


  @MessagePattern(`call.warehouse.${process.env.WAREHOUSE_ID}.stock.*.delete`)
  async handleRemoveStock(@Ctx() context: any): Promise<string> {

    // Estrae l'ID prodotto dalla subject del messaggio, dove l'asterisco (*) rappresenta l'ID
    const subjectParts = context.getSubject().split('.');
    const itemIdStr = subjectParts[subjectParts.length - 2] ?? null;


    const productIdDTO: ProductIdDto = new ProductIdDto();
    productIdDTO.id = itemIdStr;

    try {
      await validateOrReject(productIdDTO);
      //await this.inboundEventListener.removeStock(productIdDTO);
      return Promise.resolve(JSON.stringify({ result: `Prodotto con ID ${itemIdStr} rimosso` }));
    } catch (error) {
      logger.error('Error in handleRemoveStock:', error);
      return await this.errorHandler(error);
    }
  }

  @MessagePattern(`call.warehouse.${process.env.WAREHOUSE_ID}.stock.*.set`)
  async handleEditStock(@Payload('params') payload: any, @Ctx() context: any): Promise<string> {

    const subjectParts = context.getSubject().split('.');
    const itemIdStr = subjectParts[subjectParts.length - 2] ?? null;

    const productObj = payload;

    logger.log('Received edit stock payload:', productObj);

    const productDTO: ProductDto = new ProductDto();
    productDTO.id = itemIdStr;
    productDTO.name = productObj.name;
    productDTO.unitPrice = productObj.unitPrice;
    productDTO.quantity = productObj.quantity;
    productDTO.quantityReserved = productObj.quantityReserved ?? 0;
    productDTO.minThres = productObj.minThres;
    productDTO.maxThres = productObj.maxThres;
    productDTO.warehouseId = productObj.warehouseId ?? process.env.WAREHOUSE_ID;

    try {
      await validateOrReject(productDTO);
      //await this.inboundEventListener.editStock(productDTO);
      return Promise.resolve(JSON.stringify({ result: `Prodotto con ID ${itemIdStr} aggiornato` }));
    } catch (error) {
      logger.error('Error in handleEditStock:', error);
      return await this.errorHandler(error);
    }
  }



  @MessagePattern(`get.warehouse.${process.env.WAREHOUSE_ID}.stock.*`)
  async handleGetProduct(@Ctx() context: any): Promise<string> {

    // Estrae l'ID prodotto dalla subject del messaggio, dove l'asterisco (*) rappresenta l'ID
    const itemIdStr = context.getSubject().split('.').pop();

    const productIdDTO: ProductIdDto = new ProductIdDto();
    productIdDTO.id = itemIdStr;

    try {
      await validateOrReject(productIdDTO);
      //return Promise.resolve(await this.inboundEventListener.handleGetProduct(productIdDTO));
      return Promise.resolve(JSON.stringify({ result: { model: productIdDTO } }));
    } catch (error) {
      logger.error('Error in handleGetProduct:', error);
      return await this.errorHandler(error);
    }
  }

  @MessagePattern(`get.warehouse.${process.env.WAREHOUSE_ID}.inventory`)
  async handleGetInventory(): Promise<string> {
    return Promise.resolve(JSON.stringify({ result: await this.inboundEventListener.getInventory() }));
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
        return Promise.resolve(JSON.stringify({ error: { code: 'system.internalError', message: error?.message || 'Unknown error' } }));
      }
  }
}

