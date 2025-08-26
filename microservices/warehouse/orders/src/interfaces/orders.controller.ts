import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
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
  async updateOrderState(@Payload() payload: any): Promise<void> {
    console.log('🎯 UPDATEORDERSTATE CONTROLLER CALLED');
    console.log('📨 Payload:', payload);
    console.log('📨 Type of payload:', typeof payload);
    
    try {
      // ✅ GESTISCI IL PAYLOAD COMPLESSO
      let orderId: string;
      let orderState: string;

      if (typeof payload === 'object' && payload !== null) {
        // Se arriva come oggetto { orderId: "I1001", orderState: "PROCESSING" }
        orderId = payload.orderId || payload.id;
        orderState = payload.orderState || payload.state;
      } else if (typeof payload === 'string') {
        // Se arriva come stringa, potresti dover parsare un formato specifico
        // Esempio: "I1001:PROCESSING" 
        const parts = payload.split(':');
        if (parts.length === 2) {
          orderId = parts[0];
          orderState = parts[1];
        } else {
          throw new Error('Formato payload non valido');
        }
      } else {
        throw new Error('Formato payload non valido');
      }

      console.log('🔍 Order ID:', orderId);
      console.log('🔍 Order State:', orderState);

      // ✅ CONVERTI IN DTO
      const orderIdDTO: OrderIdDTO = { id: orderId };
      const orderStateDTO: OrderStateDTO = { orderState: orderState };

      const orderIdDomain = await this.dataMapper.orderIdToDomain(orderIdDTO);
      const orderStateDomain = await this.dataMapper.orderStateToDomain(orderStateDTO);

      await this.ordersService.updateOrderState(orderIdDomain, orderStateDomain);
      
      console.log('✅ Order state updated successfully');
      
    } catch (error) {
      console.error('❌ Error in updateOrderState:', error);
      throw error; // O gestisci l'errore diversamente
    }  
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
  async getOrderState(@Payload() payload: any): Promise<OrderStateDTO> {
    console.log('🎯 GETORDERSTATE CONTROLLER CALLED');
    console.log('📨 Payload:', payload);
    console.log('📨 Type of payload:', typeof payload);
    
    try {
      // ✅ GESTISCI SIA STRINGHE CHE OGGETTI
      let orderId: string;
      
      if (typeof payload === 'string') {
        // Se arriva come stringa "I1001"
        orderId = payload;
      } else if (payload && typeof payload.id === 'string') {
        // Se arriva come oggetto { id: "I1001" }
        orderId = payload.id;
      } else {
        throw new Error('Formato payload non valido');
      }
      
      console.log('🔍 Order ID extracted:', orderId);
      
      // ✅ CONVERTI IN OrderIdDTO
      const orderIdDTO: OrderIdDTO = { id: orderId };
      const orderIdDomain = await this.dataMapper.orderIdToDomain(orderIdDTO);
      
      const receivedState = await this.ordersRepository.getState(orderIdDomain);
      const response = await this.dataMapper.orderStateToDTO(receivedState);
      
      console.log('📤 Response:', response);
      return response;
      
    } catch (error) {
      console.error('❌ Error:', error);
      return { orderState: 'ERROR' };
    }  
}

  @MessagePattern('test.ping')
  async testPing(@Payload() payload: any): Promise<string> {
    console.log('🎯 PING called with payload:', payload);
    
    // ✅ RESTITUISCI SEMPRE QUALCOSA DI NON VUOTO
    const response = 'pong';
    console.log('📤 Returning:', response);
    
    return response;
  }

  @MessagePattern('get.warehouse.*.getOrder')
  async getOrder(orderIdDTO: OrderIdDTO): Promise<InternalOrderDTO | SellOrderDTO> {
    const orderId = await this.dataMapper.orderIdToDomain(orderIdDTO);
    const orderDomain = await this.ordersRepository.getById(orderId);    

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
      const ordersDomain: Orders = await this.ordersRepository.getAllOrders();
      const ordersDTO: OrdersDTO = await this.dataMapper.ordersToDTO(ordersDomain);
      return ordersDTO;
    } catch (error) {
      console.error('Errore durante il recupero di tutti gli ordini:', error);
      throw error;
    }
  } 
}
