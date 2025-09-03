import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload, Ctx } from '@nestjs/microservices';

// Use Cases
import { SyncGetAllOrdersUseCase } from './inbound-ports/syncGetAllOrders.useCase';
import { SyncGetOrderUseCase } from './inbound-ports/syncGetOrder.useCase';
import { SyncGetOrderStateUseCase } from './inbound-ports/syncGetOrderState.useCase';
import { SyncUpdateOrderStateUseCase } from './inbound-ports/syncUpdateOrderState.useCase';

// Event Listeners
import { SyncInternalOrderEventListener } from './inbound-ports/syncInternalOrderEvent.listener';
import { SyncOrderStatusEventListener } from './inbound-ports/syncOrderStatusEvent.listener';
import { SyncReservationEventListener } from './inbound-ports/syncReservationEvent.listener';
import { SyncSellOrderEventListener } from './inbound-ports/syncSellOrderEvent.listener';

import { CloudOrdersService } from 'src/application/cloud.orders.service';
import { CloudDataMapper } from '../infrastructure/mappers/cloud.data.mapper';
import { CloudOrdersRepository } from '../domain/cloud.orders.repository';

import { SyncOrders } from "src/domain/syncOrders.entity";
import { SyncOrderItem } from "src/domain/syncOrderItem.entity";
import { SyncOrderState } from "src/domain/syncOrderState.enum";

import { SyncOrderId } from "src/domain/syncOrderId.entity";
import { SyncInternalOrder } from "src/domain/syncInternalOrder.entity";
import { SyncSellOrder } from "src/domain/syncSellOrder.entity";

import { SyncOrderQuantityDTO } from "src/interfaces/dto/syncOrderQuantity.dto";
import { SyncOrderIdDTO } from "src/interfaces/dto/syncOrderId.dto";
import { SyncOrderStateDTO } from "src/interfaces/dto/syncOrderState.dto";

import { SyncInternalOrderDTO } from "src/interfaces/dto/syncInternalOrder.dto";
import { SyncSellOrderDTO } from "src/interfaces/dto/syncSellOrder.dto";
import { SyncOrdersDTO } from "src/interfaces/dto/syncOrders.dto";


@Controller()
export class CloudOrdersController implements SyncGetAllOrdersUseCase, SyncGetOrderUseCase, SyncGetOrderStateUseCase, 
SyncInternalOrderEventListener, SyncOrderStatusEventListener, SyncReservationEventListener,
SyncSellOrderEventListener, SyncUpdateOrderStateUseCase {
  constructor(
    private readonly ordersService: CloudOrdersService,
    private readonly dataMapper: CloudDataMapper,
    @Inject('CLOUDORDERSREPOSITORY')
    private readonly ordersRepository: CloudOrdersRepository
  ) {}

// MODIFICA I MESSAGE ****************************

  @MessagePattern(`call.aggregate.orders.stock.reserved`)
  // Metodo per aggiornare il n° di quantità di prodotto riservata dal magazzino.
  // Corrisponde in PUB a publishStockRepl()
  async stockReserved(@Payload() orderQuantityDTO: SyncOrderQuantityDTO): Promise<void> {
    try {    
      // Converti OrderIdDTO a dominio
      const orderId = await this.dataMapper.syncOrderIdToDomain(orderQuantityDTO.id);
      
      // Converti tutti gli OrderItemDTO a dominio
      const orderItems: SyncOrderItem[] = [];
      for (const itemDTO of orderQuantityDTO.items) {
        const orderItem = await this.dataMapper.syncOrderItemToDomain(itemDTO);
        orderItems.push(orderItem);
      }

      // Chiama il service per aggiornare lo stock riservato
      await this.ordersService.syncUpdateReservedStock(orderId, orderItems);
      
      console.log(`[AggregateO] Quantità riservata aggiornata per l'ordine: ${orderQuantityDTO.id.id}`);
      
    } catch (error) {
      console.error('[AggregateO] Errore nel sync di stockReserved:', error);
      throw error;
    }
}

  @MessagePattern(`call.aggregate.orders.sell.new`)
  async syncAddSellOrder(@Payload() payload: any): Promise<void>  { 
    try { 
    const sellOrderDTO: SyncSellOrderDTO = {
        orderId: { id: payload.orderIdDTO.id },
        items: payload.sellOrderDTO.items,
        orderState: payload.sellOrderDTO.orderState,
        creationDate: payload.sellOrderDTO.creationDate,
        warehouseDeparture: payload.sellOrderDTO.warehouseDeparture,
        destinationAddress: payload.sellOrderDTO.destinationAddress
    };
    
    console.log("[AggregateO] Ricevuto nuovo SellOrder,", JSON.stringify(sellOrderDTO, null, 2));
    const sellOrderDomain = await this.dataMapper.syncSellOrderToDomain(sellOrderDTO);
    await this.ordersService.syncCreateSellOrder(sellOrderDomain);

    } catch (error) {
      console.error('[AggregateO] Errore nel sync della creazione di un SellOrder:', error);
      throw error;
    }
  }

  @MessagePattern(`call.aggregate.orders.internal.new`)
  async syncAddInternalOrder(@Payload() payload: any): Promise<void> {    
    try {
      const internalOrderDTO: SyncInternalOrderDTO = {
          orderId: { id: payload.orderIdDTO.id },
          items: payload.internalOrderDTO.items,
          orderState: payload.internalOrderDTO.orderState,
          creationDate: payload.internalOrderDTO.creationDate,
          warehouseDeparture: payload.internalOrderDTO.warehouseDeparture,
          warehouseDestination: payload.internalOrderDTO.warehouseDestination
      };   
      console.log("[AggregateO] Ricevuto nuovo InternalOrder,", JSON.stringify(internalOrderDTO, null, 2));
      const internalOrderDomain = await this.dataMapper.syncInternalOrderToDomain(internalOrderDTO);
      await this.ordersService.syncCreateInternalOrder(internalOrderDomain);

    } catch (error) {
        console.error('[AggregateO] Errore nel sync della creazione di un InternalOrder:', error);
        throw error;
    }
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

      const orderIdDTO: SyncOrderIdDTO = { id: orderId };
      const orderStateDTO: SyncOrderStateDTO = { orderState: orderState };
      
      const orderIdDomain = await this.dataMapper.syncOrderIdToDomain(orderIdDTO);
      const orderStateDomain = await this.dataMapper.syncOrderStateToDomain(orderStateDTO);
    
      await this.ordersService.syncUpdateOrderState(orderIdDomain, orderStateDomain);
      
      console.log(`[AggregateO] Lo stato dell'ordine con ID ${orderId} è stato aggiornato con successo a ${orderState}`);
      
    } catch (error) {
      console.error('[AggregateO] Errore nell\'aggiornamento dello stato dell\'ordine:', error);
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
        const orderIdDTO: SyncOrderIdDTO = { id: orderId };
        const orderIdDomain = await this.dataMapper.syncOrderIdToDomain(orderIdDTO);
        
        await this.ordersService.syncUpdateOrderState(orderIdDomain, SyncOrderState.CANCELED);
          
      } catch (error) {
          console.error('[AggregateO] Errore nel sync della cancellazione dell\'ordine:', error);
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
          const orderIdDTO: SyncOrderIdDTO = { id: orderId };
          const orderIdDomain = await this.dataMapper.syncOrderIdToDomain(orderIdDTO);
          
          await this.ordersService.syncUpdateOrderState(orderIdDomain, SyncOrderState.COMPLETED);
      } catch (error) {
          console.error('[AggregateO] Errore nel sync del completamento dell\'ordine:', error);
          throw error;
      }  
  }

  @MessagePattern(`get.warehouse.${process.env.WAREHOUSE_ID}.order.*.state`) 
  async getOrderState(@Ctx() context: any): Promise<SyncOrderStateDTO> {
    try {
      // ESTRAZIONE TOKEN DAL SUBJECT
      const tokens = context.getSubject().split('.');
      const orderIdStr = tokens[tokens.length - 2]; // ID = Penultimo token
            
      // VALIDAZIONE DEL DTO ed ESECUZIONE GET
      let orderId: string = orderIdStr;
      const orderIdDTO: SyncOrderIdDTO = { id: orderId };
      const orderIdDomain = await this.dataMapper.syncOrderIdToDomain(orderIdDTO);
    
      const receivedState = await this.ordersRepository.getState(orderIdDomain);
      const response = await this.dataMapper.syncOrderStateToDTO(receivedState);
      
      return response;
      
    } catch (error) {
      throw new Error ('[AggregateO] Errore nel get dello stato dell\'ordine:', error);
    }  
  }

  @MessagePattern(`get.warehouse.${process.env.WAREHOUSE_ID}.order.*`)
  async getOrder(@Ctx() context: any): Promise<SyncInternalOrderDTO |  SyncSellOrderDTO> {
    // ESTRAZIONE SUBJECT
    const orderIdStr = context.getSubject().split('.').pop();

    // VALIDAZIONE DEL DTO ed ESECUZIONE GET
    let orderId: string = orderIdStr;
    let orderIdDTO: SyncOrderIdDTO = { id: orderId };
    let orderIdDomain = await this.dataMapper.syncOrderIdToDomain(orderIdDTO);
    
    const receivedOrder = await this.ordersRepository.getById(orderIdDomain);

    if (receivedOrder instanceof SyncInternalOrder) {
        const internalOrderDTO = await this.dataMapper.syncInternalOrderToDTO(receivedOrder);
        return internalOrderDTO;      
    }
    if (receivedOrder instanceof SyncSellOrder) {
      const sellOrderDTO = await this.dataMapper.syncSellOrderToDTO(receivedOrder);
      return sellOrderDTO;      
    }
    throw new Error(
      `[AggregateO] Tipo di ordine non riconosciuto per l'ordine: ${orderId}`
    );  
  }

  @MessagePattern(`get.warehouse.${process.env.WAREHOUSE_ID}.orders`) 
  async getAllOrders(): Promise<SyncOrdersDTO> {
      try {
          
          const ordersDomain: SyncOrders = await this.ordersRepository.getAllOrders();          
          const ordersDTO: SyncOrdersDTO = await this.dataMapper.syncOrdersToDTO(ordersDomain);
          
          console.log('[AggregateO] SyncOrders convertiti a DTO correttamente', ordersDTO);
          return ordersDTO;
          
      } catch (error) {
          throw new Error('[AggregateO] Non è stato possibile prelevare tutti gli ordini presenti nel magazzino.');
      }
  }


}
