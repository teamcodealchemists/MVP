import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload, Ctx } from '@nestjs/microservices';

// Use Cases
import { GetAllOrdersUseCase } from './inbound-ports/getAllOrders.useCase';
import { GetOrderUseCase } from './inbound-ports/getOrder.useCase';
import { GetOrderStateUseCase } from './inbound-ports/getOrderState.useCase';
import { UpdateOrderStateUseCase } from './inbound-ports/updateOrderState.useCase';

// Event Listeners
import { InternalOrderEventListener } from './inbound-ports/internalOrderEvent.listener';
import { OrderStatusEventListener } from './inbound-ports/orderStatusEvent.listener';
import { ReservationEventListener } from './inbound-ports/reservationEvent.listener';
import { SellOrderEventListener } from './inbound-ports/sellOrderEvent.listener';
import { ShipmentEventListener } from './inbound-ports/shipmentEvent.listener';

import { OrdersService } from 'src/application/orders.service';
import { DataMapper } from '../infrastructure/mappers/data.mapper';
import { OrdersRepository } from '../domain/orders.repository';

import { Orders } from "src/domain/orders.entity";
import { OrderItem } from "src/domain/orderItem.entity";
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
export class OrdersController implements GetAllOrdersUseCase, GetOrderUseCase, GetOrderStateUseCase, 
InternalOrderEventListener, OrderStatusEventListener, ReservationEventListener,
SellOrderEventListener, ShipmentEventListener, UpdateOrderStateUseCase {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly dataMapper: DataMapper,
    @Inject('ORDERSREPOSITORY')
    private readonly ordersRepository: OrdersRepository
  ) {}

  @MessagePattern(`call.warehouse.${process.env.WAREHOUSE_ID}.order.stock.reserved`)
  // Metodo per aggiornare il n° di quantità di prodotto riservata dal magazzino.
  // Corrisponde in PUB a publishStockRepl()
  async stockReserved(@Payload() orderQuantityDTO: OrderQuantityDTO): Promise<void> {
    try {    
      // Converti OrderIdDTO a dominio
      const orderId = await this.dataMapper.orderIdToDomain(orderQuantityDTO.id);
      
      // Converti tutti gli OrderItemDTO a dominio
      const orderItems: OrderItem[] = [];
      for (const itemDTO of orderQuantityDTO.items) {
        const orderItem = await this.dataMapper.orderItemToDomain(itemDTO);
        orderItems.push(orderItem);
      }

      // Chiama il service per aggiornare lo stock riservato
      await this.ordersService.updateReservedStock(orderId, orderItems);
      
      console.log(`Quantità riservata aggiornata per l'ordine: ${orderQuantityDTO.id.id}`);
      
    } catch (error) {
      console.error('Errore in stockReserved:', error);
      throw error;
    }
}

  @MessagePattern(`call.warehouse.${process.env.WAREHOUSE_ID}.order.sell.new`)
  async addSellOrder(@Payload() payload: any): Promise<void>  { 
    try {
    const sellOrderDTO: SellOrderDTO = {
        orderId: payload.orderId,
        items: payload.items,
        orderState: payload.orderState,
        creationDate: payload.creationDate,
        warehouseDeparture: payload.warehouseDeparture,
        destinationAddress: payload.destinationAddress
    };

    const sellOrderDomain = await this.dataMapper.sellOrderToDomain(sellOrderDTO);
    await this.ordersService.createSellOrder(sellOrderDomain);

    } catch (error) {
      console.error('Errore nella creazione di un SellOrder:', error);
      throw error;
    }
  }

  @MessagePattern(`call.warehouse.${process.env.WAREHOUSE_ID}.order.internal.new`)
  async addInternalOrder(@Payload() payload: any): Promise<void> {    
     try {
        const internalOrderDTO: InternalOrderDTO = {
          orderId: payload.orderId,
          items: payload.items,
          orderState: payload.orderState,
          creationDate: payload.creationDate,
          warehouseDeparture: payload.warehouseDeparture,
          warehouseDestination: payload.warehouseDestination
        };

        const internalOrderDomain = await this.dataMapper.internalOrderToDomain(internalOrderDTO);
        await this.ordersService.createInternalOrder(internalOrderDomain);

    } catch (error) {
        console.error('Errore nella creazione di un InternalOrder:', error);
        throw error;
    }
  }
  
  @MessagePattern(`call.warehouse.${process.env.WAREHOUSE_ID}.order.*.waiting.stock`)  
  // Metodo per comunicare al magazzino di partenza che il magazzino di destinazione 
  // ha inserito l’ordine e sta attendendo che la merce venga inviata.
  async waitingForStock(@Ctx() context: any) : Promise<void> {
    
/*  // ESTRAZIONE TOKEN DAL SUBJECT
    const tokens = context.getSubject().split('.');
    const orderIdStr = tokens[tokens.length - 3]; // ID = Terzultimo token
          
    // VALIDAZIONE DEL DTO ed ESECUZIONE GET
    let orderId: string = orderIdStr;
    const orderIdDTO: OrderIdDTO = { id: orderId };
    const orderIdDomain = await this.dataMapper.orderIdToDomain(orderIdDTO);
    
    await this.ordersService.updateOrderState(orderIdDomain, OrderState.PROCESSING); */
  }

  // Corrisponde in PUB a publishShipment()
  @MessagePattern(`call.warehouse.${process.env.WAREHOUSE_ID}.order.*.stock.shipped`)  
  // Metodo per comunicare a ordini che il magazzino ha spedito la merce.
  async stockShipped(@Ctx() context: any) : Promise<void> {
    
    // ESTRAZIONE TOKEN DAL SUBJECT
    const tokens = context.getSubject().split('.');
    const orderIdStr = tokens[tokens.length - 3]; // ID = Terzultimo token
          
    // VALIDAZIONE DEL DTO ed ESECUZIONE GET
    let orderId: string = orderIdStr;
    const orderIdDTO: OrderIdDTO = { id: orderId };
    const orderIdDomain = await this.dataMapper.orderIdToDomain(orderIdDTO);
    
    await this.ordersService.updateOrderState(orderIdDomain, OrderState.SHIPPED);
  }

  // Corrisponde in PUB a receiveShipment()
  @MessagePattern(`call.warehouse.${process.env.WAREHOUSE_ID}.order.stock.received`) 
  // Metodo per comunicare a ordini che il magazzino di destinazione ha ricevuto la merce
  async stockReceived(orderIdDTO: OrderIdDTO): Promise<void> {
    const orderId = new OrderId(orderIdDTO.id);
    await this.ordersService.receiveOrder(orderId);
  }

  // (Deduco) Corrisponde in PUB a publishReserveStock()
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

      const orderIdStr = tokens[4]; // Token 5 (es. Sf8ad4c1f-f47a-482e-9e03-648751d93185)
      const orderStateStr = tokens[7]; // Token 8 (es. PROCESSING)
      
      // VALIDAZIONE DEL DTO ed ESECUZIONE UPDATE
      let orderId: string = orderIdStr;
      let orderState: string = orderStateStr;

      const orderIdDTO: OrderIdDTO = { id: orderId };
      const orderStateDTO: OrderStateDTO = { orderState: orderState } as OrderStateDTO ;
      
      const orderIdDomain = await this.dataMapper.orderIdToDomain(orderIdDTO);
      const orderStateDomain = await this.dataMapper.orderStateToDomain(orderStateDTO);
    
      await this.ordersService.updateOrderState(orderIdDomain, orderStateDomain);
      
      console.log(`Lo stato dell'ordine con ID ${orderId} è stato aggiornato con successo a ${orderState}`);
      
    } catch (error) {
      console.error('Errore nell\'aggiornamento dello stato dell\'ordine:', error);
      throw error;
    }  
  }

  @MessagePattern(`call.warehouse.${process.env.WAREHOUSE_ID}.order.*.cancel`) 
  async cancelOrder(@Ctx() context: any): Promise<void> {  
      try {
        // ESTRAZIONE TOKEN DAL SUBJECT
        const tokens = context.getSubject().split('.');
        const orderIdStr = tokens[tokens.length - 2]; // ID = Penultimo token
              
        // VALIDAZIONE DEL DTO ed ESECUZIONE GET
        let orderId: string = orderIdStr;
        const orderIdDTO: OrderIdDTO = { id: orderId };
        const orderIdDomain = await this.dataMapper.orderIdToDomain(orderIdDTO);
        
        await this.ordersService.cancelOrder(orderIdDomain);
          
      } catch (error) {
          console.error('Errore nella cancellazione dell\'ordine:', error);
          throw error;
      }  
  }
  
  @MessagePattern(`call.warehouse.${process.env.WAREHOUSE_ID}.order.*.complete`)
  async completeOrder(@Ctx() context: any): Promise<void> {
      try {
          // ESTRAZIONE TOKEN DAL SUBJECT
          const tokens = context.getSubject().split('.');
          const orderIdStr = tokens[tokens.length - 2]; // ID = Penultimo token
                
          // VALIDAZIONE DEL DTO ed ESECUZIONE GET
          let orderId: string = orderIdStr;
          const orderIdDTO: OrderIdDTO = { id: orderId };
          const orderIdDomain = await this.dataMapper.orderIdToDomain(orderIdDTO);
          
          await this.ordersService.completeOrder(orderIdDomain);
      } catch (error) {
          console.error('Errore nel completamento dell\'ordine:', error);
          throw error;
      }  
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
      throw new Error ('Errore nel get dello stato dell\'ordine:', error);
    }  
  }

  @MessagePattern(`get.warehouse.${process.env.WAREHOUSE_ID}.order.*`)
  async getOrder(@Ctx() context: any): Promise<InternalOrderDTO | SellOrderDTO> {
    // ESTRAZIONE SUBJECT
    const orderIdStr = context.getSubject().split('.').pop();

    // VALIDAZIONE DEL DTO ed ESECUZIONE GET
    let orderId: string = orderIdStr;
    let orderIdDTO: OrderIdDTO = { id: orderId };
    let orderIdDomain = await this.dataMapper.orderIdToDomain(orderIdDTO);
    
    const receivedOrder = await this.ordersRepository.getById(orderIdDomain);

    if (receivedOrder instanceof InternalOrder) {
        const internalOrderDTO = await this.dataMapper.internalOrderToDTO(receivedOrder);
        return internalOrderDTO;      
    }
    if (receivedOrder instanceof SellOrder) {
        const sellOrderDTO = await this.dataMapper.sellOrderToDTO(receivedOrder);
        return sellOrderDTO;      
    }
    throw new Error(
      `Tipo di ordine non riconosciuto per l'ordine: ${orderId}`
    );  
  }

  @MessagePattern(`get.warehouse.${process.env.WAREHOUSE_ID}.orders`) 
  async getAllOrders(): Promise<OrdersDTO> {
      try {
          
          const ordersDomain: Orders = await this.ordersRepository.getAllOrders();
          console.log('Orders domain recuperati correttamente');
          
          const ordersDTO: OrdersDTO = await this.dataMapper.ordersToDTO(ordersDomain);
          console.log('Orders convertiti a DTO correttamente', ordersDTO);
          
          return ordersDTO;
          
      } catch (error) {
          throw new Error('Non è stato possibile prelevare tutti gli ordini presenti nel magazzino.');
      }
  }


  @MessagePattern(`get.warehouse.${process.env.WAREHOUSE_ID}.order.*.reserved.qty`) 
  async testGetReservedQuantity(@Ctx() context: any): Promise<void> {
      try {
        // ESTRAZIONE SUBJECT
        const tokens = context.getSubject().split('.');
        const orderIdStr = tokens[tokens.length - 3]; // Terzultimo token

        // VALIDAZIONE DEL DTO ed ESECUZIONE GET
        let orderId: string = orderIdStr;
        const orderIdDTO: OrderIdDTO = { id: orderId };
        const orderIdDomain = await this.dataMapper.orderIdToDomain(orderIdDTO);
        
        const receivedOrder = await this.ordersRepository.getById(orderIdDomain);

        if (receivedOrder instanceof InternalOrder) {
            const fullOrder = this.ordersRepository.checkReservedQuantityForInternalOrder(receivedOrder);
          }

          if (receivedOrder instanceof SellOrder) {
            const fullOrder = this.ordersRepository.checkReservedQuantityForSellOrder(receivedOrder);
          }

          
      } catch (error) {
          throw new Error('Non è stato possibile prelevare tutti gli ordini presenti nel magazzino.');
      }
  }
}
