import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { ProductDto } from './dto/product.dto';
import { ProductIdDto } from './dto/productId.dto';
import { InboundEventListener } from 'src/infrastructure/adapters/inbound-event.adapter';
import { validateOrReject } from 'class-validator';

const logger = new Logger('commandHandler');
@Controller()
export class CommandHandler {
  constructor(private readonly inboundEventListener: InboundEventListener) { }

  @MessagePattern(`call.warehouse.${process.env.WAREHOUSE_ID}.stock.new`)
  async handleNewStock(@Payload('params') payload: any): Promise<string> {

    const productObj = payload;

    logger.log('Received new stock payload:', productObj);

    const productDTO: ProductDto = new ProductDto();
    const productIdDto = new ProductIdDto();
    productIdDto.id = productObj.id as string;
    productDTO.id = productIdDto;
    productDTO.name = productObj.name;
    productDTO.unitPrice = productObj.unitPrice;
    productDTO.quantity = productObj.quantity;
    productDTO.quantityReserved = productObj.quantityReserved ?? 0;
    productDTO.minThres = productObj.minThres;
    productDTO.maxThres = productObj.maxThres;
    productDTO.warehouseId = productObj.warehouseId ?? process.env.WAREHOUSE_ID;

    try {
      await validateOrReject(productDTO);
      await this.inboundEventListener.newStock(productDTO);
      let RID = `warehouse.${process.env.WAREHOUSE_ID}.stock.${productDTO.id.id}`;
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
      await this.inboundEventListener.removeStock(productIdDTO);
      return Promise.resolve(JSON.stringify({ result: `Product with ID ${itemIdStr} removed` }));
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
    const productIdDto = new ProductIdDto();
    productIdDto.id = itemIdStr as string;
    productDTO.id = productIdDto;
    productDTO.name = productObj.name;
    productDTO.unitPrice = productObj.unitPrice;
    productDTO.quantity = productObj.quantity;
    productDTO.quantityReserved = productObj.quantityReserved ?? 0;
    productDTO.minThres = productObj.minThres;
    productDTO.maxThres = productObj.maxThres;
    productDTO.warehouseId = productObj.warehouseId ?? process.env.WAREHOUSE_ID;

    try {
      await validateOrReject(productDTO);
      await this.inboundEventListener.editStock(productDTO);
      return Promise.resolve(JSON.stringify({ result: `Product with ID ${itemIdStr} updated` }));
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
      const result = await this.inboundEventListener.handleGetProduct(productIdDTO);
      return Promise.resolve(JSON.stringify({ result: { model: result } }));
    } catch (error) {
      logger.error('Error in handleGetProduct:', error);
      return await this.errorHandler(error);
    }
  }

  @MessagePattern(`get.warehouse.${process.env.WAREHOUSE_ID}.inventory`)
  async handleGetInventoryCollection(): Promise<string> {
    // Ottieni tutti i prodotti dall'inventario
    const products = (await this.inboundEventListener.getInventory()).getInventory();

    // Mappa ogni prodotto in un riferimento rid
    const collection = products.map(product => ({
      rid: `warehouse.${process.env.WAREHOUSE_ID}.stock.${product.getId()}`
    }));

    return Promise.resolve(JSON.stringify({ result: { collection } }));
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
      } else if (typeof error?.message === 'string' && error.message.toLowerCase().includes('not found')) {
        message = error.message;
        return Promise.resolve(JSON.stringify({ error: { code: 'system.notFound', message }, meta: { status: 404 } }));
      } else {
        return Promise.resolve(JSON.stringify({ error: { code: 'system.internalError', message: error?.message || 'Unknown error' }, meta: { status: 404 } }));
      }
  }
}

