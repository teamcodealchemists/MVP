import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ProductDto } from './dto/product.dto';
import { ProductIdDto } from './dto/productId.dto';
import { DataMapper } from '../infrastructure/mappers/dataMapper';
import { Product } from 'src/domain/product.entity';
import { Inventory } from 'src/domain/inventory.entity';
import { InboundEventListener } from 'src/infrastructure/adapters/inbound-event.adapter';

const logger = new Logger('commandHandler');
@Controller()
export class CommandHandler {
  constructor(private readonly inboundEventListener : InboundEventListener) { }

  @MessagePattern(`api.warehouse.1.newStock`)
  async handleNewStock(payload: any): Promise<void> {
    const data = typeof payload === 'string' ? payload : payload?.data ? payload.data.toString() : payload;

    const productObj = JSON.parse(data);

    const productDTO: ProductDto = {
      id: productObj.id,
      name: productObj.name,
      unitPrice: productObj.unitPrice,
      quantity: productObj.quantity,
      minThres: productObj.minThres,
      maxThres: productObj.maxThres,
      warehouseId : productObj.warehouseId
    };
    this.inboundEventListener.newStock(productDTO);
    return Promise.resolve();
  }


  @MessagePattern(`api.warehouse.1.removeStock`)
  async handleRemoveStock(payload: any): Promise<void> {

    const data =
      typeof payload === 'string'
        ? payload
        : payload?.data
          ? payload.data.toString()
          : payload;


    const productObj = JSON.parse(data);
    const productIdDTO: ProductIdDto = {
      id: productObj.id
    };

    this.inboundEventListener.removeStock(productIdDTO);
    return Promise.resolve();
  }



  @MessagePattern(`api.warehouse.1.editStock`) //call.warehouse.variabile.stock.#stock.set
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
      minThres: productObj.minThres,
      maxThres: productObj.maxThres,
      warehouseId : productObj.warehouseId
    };
    this.inboundEventListener.editStock(productDTO);
    return Promise.resolve();
  }



  @MessagePattern(`api.warehouse.${process.env.WAREHOUSE_ID}.getProduct`)
  async handleGetProduct(payload: any): Promise<Product | null> {

    const data =
      typeof payload === 'string'
        ? payload
        : payload?.data
          ? payload.data.toString()
          : payload;

    let productIdObj: { id: string };

    try {
      productIdObj = JSON.parse(data);
    } catch (err) {
      console.error('[handleGetProduct] JSON parsing error:', err);
      return null;
    }

    const productIdDTO: ProductIdDto = {
      id: productIdObj.id,
    };

    const productId = DataMapper.toDomainProductId(productIdDTO);
    return Promise.resolve(await this.inboundEventListener.handleGetProduct(productId));
  }


  @MessagePattern(`api.warehouse.${process.env.WAREHOUSE_ID}.getInventory`)
  async handleGetInventory(): Promise<Inventory> {
    return Promise.resolve(await this.inboundEventListener.getInventory());
  }

}
