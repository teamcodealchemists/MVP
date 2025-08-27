import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload, Ctx } from '@nestjs/microservices';
import { OrdersService } from 'src/application/orders.service';
import { DataMapper } from '../application/data.mapper';
import { OrdersRepository } from '../domain/orders.repository';

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
    @Inject('ORDERSREPOSITORY')
    private readonly ordersRepository: OrdersRepository
  ) {}

  @MessagePattern(`call.warehouse.${process.env.WAREHOUSE_ID}.order.stock.reserved`)
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

  @MessagePattern(`call.warehouse.${process.env.WAREHOUSE_ID}.order.sell.new`)
  async addSellOrder(sellOrderDTO: SellOrderDTO): Promise<void>  {
    console.log('Ricevuto un SellOrderDTO:', sellOrderDTO);
    
    const sellOrderDomain = await this.dataMapper.sellOrderToDomain(sellOrderDTO);
    await this.ordersService.createSellOrder(sellOrderDomain);
    
    console.log('SellOrder creato con successo!');  
  }

  @MessagePattern(`call.warehouse.${process.env.WAREHOUSE_ID}.order.internal.new`)
  async addInternalOrder(internalOrderDTO: InternalOrderDTO): Promise<void> {
    console.log('Ricevuto un InternalOrderDTO:', internalOrderDTO);
    
    const internalOrderDomain = await this.dataMapper.internalOrderToDomain(internalOrderDTO);
    await this.ordersService.createInternalOrder(internalOrderDomain);
    
    console.log('InternalOrder creato con successo!');  
  }

  @MessagePattern(`call.warehouse.${process.env.WAREHOUSE_ID}.waiting.stock`)  
  // Metodo per comunicare al magazzino di partenza che il magazzino di destinazione 
  // ha inserito l’ordine e sta attendendo che la merce venga inviata.
  async waitingForStock(orderIdDTO: OrderIdDTO) : Promise<void> {
    const orderId = new OrderId(orderIdDTO.id);
    await this.ordersService.updateOrderState(orderId, OrderState.PROCESSING);
  }

  @MessagePattern(`call.warehouse.${process.env.WAREHOUSE_ID}.order.stock.shipped`)  
  // Metodo per comunicare a ordini che il magazzino ha spedito la merce.
  async stockShipped(orderIdDTO: OrderIdDTO) : Promise<void> {
    const orderId = new OrderId(orderIdDTO.id);
    await this.ordersService.shipOrder(orderId);
  }

  @MessagePattern(`call.warehouse.${process.env.WAREHOUSE_ID}.order.stock.received`) 
  // Metodo per comunicare a ordini che il magazzino di destinazione ha ricevuto la merce
  async stockReceived(orderIdDTO: OrderIdDTO): Promise<void> {
    const orderId = new OrderId(orderIdDTO.id);
    await this.ordersService.receiveOrder(orderId);
  }

  @MessagePattern(`call.warehouse.${process.env.WAREHOUSE_ID}.order.replenishment.received`) 
  // Metodo per comunicare al servizio di ordini che il riassortimento è stato completato.
  async replenishmentReceived(orderIdDTO: OrderIdDTO): Promise<void> {
    const orderId = new OrderId(orderIdDTO.id);
    await this.ordersService.completeOrder(orderId);
  }


  @MessagePattern(`call.warehouse.${process.env.WAREHOUSE_ID}.order.*.state.update.*`) 
  async updateOrderState(@Ctx() context: any): Promise<void> {  
    try {
      // ESTRAZIONE TOKEN DAL SUBJECT
      const tokens = context.getSubject().split('.');

      const orderIdStr = tokens[4]; // Token 5 (es. I1001)
      const orderStateStr = tokens[7]; // Token 8 (es. PROCESSING)
      
      // VALIDAZIONE DEL DTO ed ESECUZIONE UPDATE
      let orderId: string = orderIdStr;
      let orderState: string = orderStateStr;

      const orderIdDTO: OrderIdDTO = { id: orderId };
      const orderStateDTO: OrderStateDTO = { orderState: orderState };
      
      const orderIdDomain = await this.dataMapper.orderIdToDomain(orderIdDTO);
      const orderStateDomain = await this.dataMapper.orderStateToDomain(orderStateDTO);
    
      await this.ordersService.updateOrderState(orderIdDomain, orderStateDomain);
      
      console.log(`Lo stato dell'ordine con ID ${orderId} è stato aggiornato con successo a ${orderState}`);
      
    } catch (error) {
      console.error('Errore in updateOrderState:', error);
      throw error;
    }  
  }

  @MessagePattern(`call.warehouse.${process.env.WAREHOUSE_ID}.order.*.cancel`) 
  async cancelOrder(orderIdDTO: OrderIdDTO): Promise<void> {
    const orderId = await this.dataMapper.orderIdToDomain(orderIdDTO);

    await this.ordersService.cancelOrder(orderId);
  }

  @MessagePattern(`call.warehouse.${process.env.WAREHOUSE_ID}.order.*.complete`)
  async completeOrder(orderIdDTO: OrderIdDTO): Promise<void> {
    const orderId = await this.dataMapper.orderIdToDomain(orderIdDTO);

    await this.ordersService.completeOrder(orderId);
  }

  @MessagePattern(`get.warehouse.${process.env.WAREHOUSE_ID}.order.*.state`) 
  async getOrderState(@Ctx() context: any): Promise<OrderStateDTO> {
    try {
      // ESTRAZIONE TOKEN DAL SUBJECT
      const tokens = context.getSubject().split('.');
      const orderIdStr = tokens[tokens.length - 2]; // ID = Penultimo token
            
      // VALIDAZIONE DEL DTO ed ESECUZIONE GET
      let orderId: string = orderIdStr;
      const orderIdDTO: OrderIdDTO = { id: orderId };
      const orderIdDomain = await this.dataMapper.orderIdToDomain(orderIdDTO);
    
      const receivedState = await this.ordersRepository.getState(orderIdDomain);
      const response = await this.dataMapper.orderStateToDTO(receivedState);
      
      return response;
      
    } catch (error) {
      console.error('Errore nel get dello stato dell\'ordine:', error);
      return { orderState: 'ERROR' };
    }  
  }

  @MessagePattern(`get.warehouse.${process.env.WAREHOUSE_ID}.order.*`)
  async getOrder(@Ctx() context: any): Promise<InternalOrderDTO | SellOrderDTO> {
    // ESTRAZIONE SUBJECT
    const orderIdStr = context.getSubject().split('.').pop();

    // VALIDAZIONE DEL DTO ed ESECUZIONE GET
    let orderId: string = orderIdStr;
    const orderIdDTO: OrderIdDTO = { id: orderId };
    const orderIdDomain = await this.dataMapper.orderIdToDomain(orderIdDTO);
    console.log("Valore orderId: ", orderIdDomain);
    
    const receivedOrder = await this.ordersRepository.getById(orderIdDomain);
    console.log("Valore orderDomain: ", receivedOrder);

    if (receivedOrder instanceof InternalOrder) {
          console.log("Valore INTERNAL!");

        return this.dataMapper.internalOrderToDTO(receivedOrder);
      }

      if (receivedOrder instanceof SellOrder) {
        console.log("Valore SELL! ");
        return this.dataMapper.sellOrderToDTO(receivedOrder);
      }

      throw new Error(
        `Tipo di ordine non riconosciuto per l'ordine: ${orderId}`
      );  
  }

  @MessagePattern(`get.warehouse.${process.env.WAREHOUSE_ID}.order.all`) 
  async getAllOrders(): Promise<OrdersDTO> {
    try {
      const ordersDomain: Orders = await this.ordersRepository.getAllOrders();
      const ordersDTO: OrdersDTO = await this.dataMapper.ordersToDTO(ordersDomain);
      return ordersDTO;
    } catch (error) {
      console.error('Errore nel recupero di tutti gli ordini:', error);
      throw error;
    }
  } 
}
