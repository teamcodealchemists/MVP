import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { InventoryService } from 'src/application/inventory.service';
import { productDto } from './dto/product.dto';
import { productIdDto } from './dto/productId.dto';
import { DataMapper } from '../infrastructure/mappers/dataMapper';
import { plainToInstance } from 'class-transformer';
import { Product } from 'src/domain/product.entity';
import { Inventory } from 'src/domain/inventory.entity';
import { Payload } from '@nestjs/microservices';
import { OutboundEventAdapter } from 'src/infrastructure/adapters/outbound-event.adapter';
import { WarehouseId } from 'src/domain/warehouseId.entity';


@Controller()
export class CommandHandler {
  constructor(private readonly inventoryService: InventoryService) { }

  @MessagePattern(`api.warehouse.1.newStock`)
  async handleNewStock(payload: any): Promise<void> {
    const data = typeof payload === 'string' ? payload : payload?.data ? payload.data.toString() : payload;

    const productObj = JSON.parse(data);

    const productDTO: productDto = {
      id: productObj.id,
      name: productObj.name,
      unitPrice: productObj.unitPrice,
      quantity: productObj.quantity,
      minThres: productObj.minThres,
      maxThres: productObj.maxThres,
      warehouseId : productObj.warehouseId
    };

    const product = DataMapper.toDomainProduct(productDTO);
    return this.inventoryService.addProduct(product);

  }


  @MessagePattern(`api.warehouse.1.removeStock`)
  async handleRemoveStock(payload: any): Promise<boolean> {

    const data =
      typeof payload === 'string'
        ? payload
        : payload?.data
          ? payload.data.toString()
          : payload;


    const productObj = JSON.parse(data);
    const productIdDTO: productIdDto = {
      id: productObj.id
    };


    const productId = DataMapper.toDomainProductId(productIdDTO);
    return this.inventoryService.removeProduct(productId);

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


    const productDTO: productDto = {
      id: productObj.id,
      name: productObj.name,
      unitPrice: productObj.unitPrice,
      quantity: productObj.quantity,
      minThres: productObj.minThres,
      maxThres: productObj.maxThres
    };

    const product = DataMapper.toDomainProduct(productDTO);
    console.log(product);
    return this.inventoryService.editProduct(product)
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

    const productIdDTO: productIdDto = {
      id: productIdObj.id,
    };

    const productId = DataMapper.toDomainProductId(productIdDTO);
    return this.inventoryService.getProduct(productId);
  }


  @MessagePattern(`api.warehouse.${process.env.WAREHOUSE_ID}.getInventory`)
  async handleGetInventory(): Promise<Inventory> {
    return this.inventoryService.getInventory();
  }

}
