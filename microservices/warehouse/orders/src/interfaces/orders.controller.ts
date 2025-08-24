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
import { OrdersDTO } from "src/interfaces/dto/orders.dto";

@Controller()
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly dataMapper: DataMapper,
    private readonly ordersRepositoryMongo: OrdersRepositoryMongo
  ) {}

/*   @MessagePattern(`call.orders.${process.env.ORDER_ID}.----`)
  getHello(): Promise<string> {
    return this.ordersService.getHello();
  } */

  @MessagePattern('call.orders.${process.env.ORDER_ID}.stockReserved')
  // Metodo per aggiornare il n° di quantità di prodotto riservata dal magazzino.
  async stockReserved(orderQuantityDTO: OrderQuantityDTO): Promise<void> {
    const orderId = await this.dataMapper.orderIdToDomain(orderQuantityDTO.id);
  
    const orderItems: OrderItem[] = [];
    for (const itemDTO of orderQuantityDTO.items) {
      const orderItem = await this.dataMapper.orderItemToDomain(itemDTO);
      orderItems.push(orderItem);
    }

    await this.ordersService.updateReservedStock(orderId, orderItems); 
  }

  @MessagePattern('call.orders.${process.env.ORDER_ID}.addSellOrder')
  async addSellOrder(sellOrderDTO: SellOrderDTO): Promise<void>  {
    const sellOrderDomain = await this.dataMapper.sellOrderToDomain(sellOrderDTO);
    await this.ordersService.createSellOrder(sellOrderDomain);
  }

  @MessagePattern('call.orders.${process.env.ORDER_ID}.addInternalOrder')
  async addInternalOrder(internalOrderDTO: InternalOrderDTO): Promise<void> {
    const internalOrderDomain = await this.dataMapper.internalOrderToDomain(internalOrderDTO);
    await this.ordersService.createInternalOrder(internalOrderDomain);
  }

  // Metodi dello ShipmentEventListener
  @MessagePattern('call.warehouse.*.waitingForStock')  
  // Metodo per comunicare al magazzino di partenza che il magazzino di destinazione 
  // ha inserito l’ordine e sta attendendo che la merce venga inviata.
  async waitingForStock(orderIdDTO: OrderIdDTO) : Promise<void> {
    const orderId = new OrderId(orderIdDTO.id);
    await this.ordersService.updateOrderState(orderId, OrderState.PROCESSING);
  }

  @MessagePattern('call.warehouse.*.stockShipped')  
  // Metodo per comunicare a ordini che il magazzino ha spedito la merce.
  async stockShipped(orderIdDTO: OrderIdDTO) : Promise<void> {
    const orderId = new OrderId(orderIdDTO.id);
    await this.ordersService.shipOrder(orderId);
  }

  @MessagePattern('call.warehouse.*.stockReceived') 
  // Metodo per comunicare a ordini che il magazzino di destinazione ha ricevuto la merce
  async stockReceived(orderIdDTO: OrderIdDTO): Promise<void> {
    const orderId = new OrderId(orderIdDTO.id);
    await this.ordersService.receiveOrder(orderId);
  }

  @MessagePattern('call.warehouse.*.replenishmentReceived') 
  // Metodo per comunicare al servizio di ordini che il riassortimento è stato completato.
  async replenishmentReceived(orderIdDTO: OrderIdDTO): Promise<void> {
    const orderId = new OrderId(orderIdDTO.id);
    await this.ordersService.completeOrder(orderId);
  }


  @MessagePattern('call.warehouse.*.updateOrderState') 
  async updateOrderState(orderIdDTO: OrderIdDTO, orderStateDTO: OrderStateDTO): Promise<void> {
    const orderId = await this.dataMapper.orderIdToDomain(orderIdDTO);
    const orderState = await this.dataMapper.orderStateToDomain(orderStateDTO);

    await this.ordersService.updateOrderState(orderId, orderState);
  }

  @MessagePattern('call.warehouse.*.cancelOrder') 
  async cancelOrder(orderIdDTO: OrderIdDTO): Promise<void> {
    const orderId = await this.dataMapper.orderIdToDomain(orderIdDTO);

    await this.ordersService.cancelOrder(orderId);
  }

  @MessagePattern('call.warehouse.*.completeOrder')
  async completeOrder(orderIdDTO: OrderIdDTO): Promise<void> {
    const orderId = await this.dataMapper.orderIdToDomain(orderIdDTO);

    await this.ordersService.completeOrder(orderId);
  }

  @MessagePattern('get.warehouse.*.getOrderState') 
  async getOrderState(orderIdDTO: OrderIdDTO): Promise<OrderStateDTO> {
    const orderId = await this.dataMapper.orderIdToDomain(orderIdDTO);
    const receivedState = await this.ordersRepositoryMongo.getState(orderId);
    
    return await this.dataMapper.orderStateToDTO(receivedState);
  }

  @MessagePattern('get.warehouse.*.getOrder')
  async getOrder(orderIdDTO: OrderIdDTO): Promise<InternalOrderDTO | SellOrderDTO> {
    const orderId = await this.dataMapper.orderIdToDomain(orderIdDTO);
    const orderDomain = await this.ordersRepositoryMongo.getById(orderId);    

    if (orderDomain instanceof InternalOrder) {
        return this.dataMapper.internalOrderToDTO(orderDomain);
      }

      if (orderDomain instanceof SellOrder) {
        return this.dataMapper.sellOrderToDTO(orderDomain);
      }

      throw new Error(
        `Tipo di ordine non riconosciuto per l'ID Ordine: ${orderId}`
      );  
  }

  @MessagePattern('get.warehouse.*.getAllOrders') 
  async getAllOrders(): Promise<OrdersDTO> {
    try {
      const ordersDomain: Orders = await this.ordersRepositoryMongo.getAllOrders();
      const ordersDTO: OrdersDTO = await this.dataMapper.ordersToDTO(ordersDomain);
      return ordersDTO;
    } catch (error) {
      console.error('Errore durante il recupero di tutti gli ordini:', error);
      throw error;
    }
  } 
}
