import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { OrdersService } from 'src/application/orders.service';
import { DataMapper } from './data.mapper';
import { OrdersRepositoryMongo } from '../infrastructure/adapters/mongodb/orders.repository.impl';


import { Orders } from "src/domain/orders.entity";
import { OrderItem } from "src/domain/orderItem.entity";
import { OrderItemDetail } from "src/domain/orderItemDetail.entity";
import { OrderState } from "src/domain/orderState.enum";

import { OrderId } from "src/domain/orderId.entity";
import { InternalOrder } from "src/domain/internalOrder.entity";
import { SellOrder } from "src/domain/sellOrder.entity";

import { OrderQuantityDTO } from "src/interfaces/dto/orderQuantity.dto";
import { OrderIdDTO } from "src/interfaces/dto/orderId.dto";
import { OrderStateDTO } from "src/interfaces/dto/orderState.dto";

import { InternalOrderDTO } from "src/interfaces/dto/internalOrder.dto";
import { SellOrderDTO } from "src/interfaces/dto/sellOrder.dto";

@Controller()
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly dataMapper: DataMapper,
    private readonly ordersRepositoryMongo: OrdersRepositoryMongo
  ) {}

/*   @MessagePattern(`api.warehouse.${process.env.WAREHOUSE_ID}.getHello`)
  getHello(): Promise<string> {
    return this.ordersService.getHello();
  } */

  /* @MessagePattern('api.orders.${process.env.ORDER_ID}.stockReserved') */
  async stockReserved(orderQuantityDTO: OrderQuantityDTO): Promise<void> {
    const orderId = await this.dataMapper.orderIdToDomain(orderQuantityDTO.id);
  
    const orderItems: OrderItem[] = [];
    for (const itemDTO of orderQuantityDTO.items) {
      const orderItem = await this.dataMapper.orderItemToDomain(itemDTO);
      orderItems.push(orderItem);
    }

    await this.ordersService.updateReservedStock(orderId, orderItems); 
  }

  /* @MessagePattern('api.orders.${process.env.ORDER_ID}.addSellOrder') */
  async addSellOrder(sellOrderDTO: SellOrderDTO): Promise<void>  {
    const sellOrderDomain = await this.dataMapper.sellOrderToDomain(sellOrderDTO);
    await this.ordersService.createSellOrder(sellOrderDomain);
  }

  /* @MessagePattern('api.orders.${process.env.ORDER_ID}.addInternalOrder') */
  async addInternalOrder(internalOrderDTO: InternalOrderDTO): Promise<void> {
    const internalOrderDomain = await this.dataMapper.internalOrderToDomain(internalOrderDTO);
    await this.ordersService.createInternalOrder(internalOrderDomain);
  }

/* TODO: Metodi dello ShipmentEventListener
  // @MessagePattern('api.orders.${process.env.ORDER_ID}.waitingForStock')  
  async waitingForStock(orderIdDTO: OrderIdDTO) : Promise<void> {
    const orderId = await this.dataMapper.orderIdToDomain(orderIdDTO);
    await this.ordersService.updateOrderState(orderId, OrderState.PENDING);
  }

  // @MessagePattern('api.orders.${process.env.ORDER_ID}.stockShipped')  
  async stockShipped(orderIdDTO: OrderIdDTO) : Promise<void> {
    await this.ordersService.updateOrderState(orderId, OrderState.PENDING);

  }

  // @MessagePattern('api.orders.${process.env.ORDER_ID}.stockReceived') 
  async stockReceived(orderIdDTO: OrderIdDTO): Promise<void> {

  }

  // @MessagePattern('api.orders.${process.env.ORDER_ID}.replenishmentReceived') 
  async replenishmentReceived(orderIdDTO: OrderIdDTO): Promise<void> {

  }
 */
  // @MessagePattern('api.orders.${process.env.ORDER_ID}.updateOrderState') 
  async updateOrderState(orderIdDTO: OrderIdDTO, orderStateDTO: OrderStateDTO): Promise<void> {
    const orderId = await this.dataMapper.orderIdToDomain(orderIdDTO);
    const orderState = await this.dataMapper.orderStateToDomain(orderStateDTO);

    await this.ordersService.updateOrderState(orderId, orderState);
  }

  // @MessagePattern('api.orders.${process.env.ORDER_ID}.cancelOrder') 
  async cancelOrder(orderIdDTO: OrderIdDTO): Promise<void> {
    const orderId = await this.dataMapper.orderIdToDomain(orderIdDTO);

    await this.ordersService.cancelOrder(orderId);
  }

  // @MessagePattern('api.orders.${process.env.ORDER_ID}.completeOrder')
  async completeOrder(orderIdDTO: OrderIdDTO): Promise<void> {
    const orderId = await this.dataMapper.orderIdToDomain(orderIdDTO);

    await this.ordersService.completeOrder(orderId);
  }

  // @MessagePattern('api.orders.${process.env.ORDER_ID}.getOrderState') 
  async getOrderState(orderIdDTO: OrderIdDTO): Promise<OrderStateDTO> {
    const orderId = await this.dataMapper.orderIdToDomain(orderIdDTO);
    const receivedState = await this.ordersRepositoryMongo.getState(orderId);
    
    return await this.dataMapper.orderStateToDTO(receivedState);
  }
/* 
  // @MessagePattern('api.orders.${process.env.ORDER_ID}.getOrder')
  async getOrder(orderIdDTO: OrderIdDTO): Promise<InternalOrderDTO | SellOrderDTO> {
    const orderId = await this.dataMapper.orderIdToDomain(orderIdDTO);
    const receivedOrder = await this.ordersRepositoryMongo.getState(orderId);
    
    return await this.dataMapper.oToDTO(receivedOrder);
  }

  // @MessagePattern('api.orders.${process.env.ORDER_ID}.getAllOrders') 
  async getAllOrders(): Promise<OrdersDTO> {

  } */
}
