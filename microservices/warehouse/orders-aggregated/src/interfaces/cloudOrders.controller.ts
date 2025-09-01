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

  @MessagePattern(`call.warehouse.${process.env.WAREHOUSE_ID}.order.stock.reserved`)
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
      
      console.log(`Quantità riservata aggiornata per l'ordine: ${orderQuantityDTO.id.id}`);
      
    } catch (error) {
      console.error('Errore nel sync di stockReserved:', error);
      throw error;
    }
}

  @MessagePattern(`call.warehouse.${process.env.WAREHOUSE_ID}.order.sell.new`)
  async syncAddSellOrder(@Payload() payload: any): Promise<void>  { 
    try {
      // Separa il payload in due DTO
    const orderIdDTO: SyncOrderIdDTO = {
        id: payload.orderId.id
    };
  
    const sellOrderDTO: SyncSellOrderDTO = {
        items: payload.items,
        orderState: payload.orderState,
        creationDate: payload.creationDate,
        warehouseDeparture: payload.warehouseDeparture,
        destinationAddress: payload.destinationAddress
    };

    const sellOrderDomain = await this.dataMapper.syncSellOrderToDomain(orderIdDTO, sellOrderDTO);

    await this.ordersService.syncCreateSellOrder(sellOrderDomain);

    } catch (error) {
      console.error('Errore nel sync della creazione di un SellOrder:', error);
      throw error;
    }
  }

  @MessagePattern(`call.warehouse.${process.env.WAREHOUSE_ID}.order.internal.new`)
  async syncAddInternalOrder(@Payload() payload: any): Promise<void> {    
    // Separa il payload in due DTO
    try {
      const orderIdDTO: SyncOrderIdDTO = {
          id: payload.orderId.id
      };
      const internalOrderDTO: SyncInternalOrderDTO = {
          items: payload.items,
          orderState: payload.orderState,
          creationDate: payload.creationDate,
          warehouseDeparture: payload.warehouseDeparture,
          warehouseDestination: payload.warehouseDestination
      };

      const internalOrderDomain = await this.dataMapper.syncInternalOrderToDomain(orderIdDTO, internalOrderDTO);
      const addedInternalOrder = await this.ordersService.syncCreateInternalOrder(internalOrderDomain);
    } catch (error) {
        console.error('Errore nel sync della creazione di un InternalOrder:', error);
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
        const orderIdDTO: SyncOrderIdDTO = { id: orderId };
        const orderIdDomain = await this.dataMapper.syncOrderIdToDomain(orderIdDTO);
        
        await this.ordersService.syncUpdateOrderState(orderIdDomain, SyncOrderState.CANCELED);
          
      } catch (error) {
          console.error('Errore nel sync della cancellazione dell\'ordine:', error);
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
          console.error('Errore nel sync del completamento dell\'ordine:', error);
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
      throw new Error ('Errore nel get dello stato dell\'ordine:', error);
    }  
  }

  @MessagePattern(`get.warehouse.${process.env.WAREHOUSE_ID}.order.*`)
  async getOrder(@Ctx() context: any): Promise<{SyncOrderIdDTO, SyncInternalOrderDTO} | {SyncOrderIdDTO, SyncSellOrderDTO}> {
    // ESTRAZIONE SUBJECT
    const orderIdStr = context.getSubject().split('.').pop();

    // VALIDAZIONE DEL DTO ed ESECUZIONE GET
    let orderId: string = orderIdStr;
    let orderIdDTO: SyncOrderIdDTO = { id: orderId };
    let orderIdDomain = await this.dataMapper.syncOrderIdToDomain(orderIdDTO);
    
    const receivedOrder = await this.ordersRepository.getById(orderIdDomain);

    if (receivedOrder instanceof SyncInternalOrder) {
        const { orderIdDTO, internalOrderDTO } = await this.dataMapper.syncInternalOrderToDTO(receivedOrder);
        return { SyncOrderIdDTO: orderIdDTO, SyncInternalOrderDTO: internalOrderDTO };      
    }
    if (receivedOrder instanceof SyncSellOrder) {
      const { orderIdDTO, sellOrderDTO } = await this.dataMapper.syncSellOrderToDTO(receivedOrder);
      return { SyncOrderIdDTO: orderIdDTO, SyncSellOrderDTO: sellOrderDTO };      
    }
    throw new Error(
      `Tipo di ordine non riconosciuto per l'ordine: ${orderId}`
    );  
  }

  @MessagePattern(`get.warehouse.${process.env.WAREHOUSE_ID}.orders`) 
  async getAllOrders(): Promise<SyncOrdersDTO> {
      try {
          
          const ordersDomain: SyncOrders = await this.ordersRepository.getAllOrders();          
          const ordersDTO: SyncOrdersDTO = await this.dataMapper.syncOrdersToDTO(ordersDomain);
          
          console.log('SyncOrders convertiti a DTO correttamente', ordersDTO);
          return ordersDTO;
          
      } catch (error) {
          throw new Error('Non è stato possibile prelevare tutti gli ordini presenti nel magazzino.');
      }
  }


}
