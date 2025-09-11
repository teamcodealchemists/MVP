import { Injectable, Inject, Logger } from '@nestjs/common';
import { CloudOrdersService } from 'src/application/cloud.orders.service';
import { CloudDataMapper } from 'src/infrastructure/mappers/cloud.data.mapper';
import { CloudOrdersRepositoryMongo } from 'src/infrastructure/adapters/mongodb/cloud.orders.repository.impl';

// Use Cases
import { SyncGetAllOrdersUseCase } from '../../interfaces/inbound-ports/syncGetAllOrders.useCase';
import { SyncGetOrderUseCase } from '../../interfaces/inbound-ports/syncGetOrder.useCase';
import { SyncGetOrderStateUseCase } from '../../interfaces/inbound-ports/syncGetOrderState.useCase';
import { SyncUpdateOrderStateUseCase } from '../../interfaces/inbound-ports/syncUpdateOrderState.useCase';

// Event Listeners
import { SyncInternalOrderEventListener } from '../../interfaces/inbound-ports/syncInternalOrderEvent.listener';
import { SyncOrderStatusEventListener } from '../../interfaces/inbound-ports/syncOrderStatusEvent.listener';
import { SyncReservationEventListener } from '../../interfaces/inbound-ports/syncReservationEvent.listener';
import { SyncSellOrderEventListener } from '../../interfaces/inbound-ports/syncSellOrderEvent.listener';

// DTO
import { SyncOrderQuantityDTO } from "src/interfaces/dto/syncOrderQuantity.dto";
import { SyncOrderIdDTO } from "src/interfaces/dto/syncOrderId.dto";
import { SyncOrderStateDTO } from "src/interfaces/dto/syncOrderState.dto";

import { SyncInternalOrderDTO } from "src/interfaces/dto/syncInternalOrder.dto";
import { SyncSellOrderDTO } from "src/interfaces/dto/syncSellOrder.dto";
import { SyncOrdersDTO } from "src/interfaces/dto/syncOrders.dto";
import { SyncOrderState } from "src/domain/syncOrderState.enum";

// DOMAIN
import { SyncInternalOrder } from "src/domain/syncInternalOrder.entity";
import { SyncSellOrder } from "src/domain/syncSellOrder.entity";


@Injectable()
export class CloudInboundPortsAdapter implements SyncGetAllOrdersUseCase, 
  SyncGetOrderUseCase, SyncGetOrderStateUseCase, SyncInternalOrderEventListener, 
  SyncOrderStatusEventListener, SyncReservationEventListener, 
  SyncSellOrderEventListener, SyncUpdateOrderStateUseCase {
    
    private readonly logger = new Logger(CloudInboundPortsAdapter.name);

  constructor(
    private readonly ordersService: CloudOrdersService,
    private readonly dataMapper: CloudDataMapper,
    @Inject('CLOUDORDERSREPOSITORY')
    private readonly cloudOrdersRepositoryMongo: CloudOrdersRepositoryMongo  ) 
    {}

  async stockReserved(orderQuantityDTO: SyncOrderQuantityDTO): Promise<void> {
    const orderId = await this.dataMapper.syncOrderIdToDomain(orderQuantityDTO.id);
    const orderItems = await Promise.all(
      orderQuantityDTO.items.map(itemDTO => this.dataMapper.syncOrderItemToDomain(itemDTO))
    );
    await this.ordersService.syncUpdateReservedStock(orderId, orderItems);
    this.logger.log(`[AggregateO] Quantità riservate aggiornate per l'ordine: ${orderQuantityDTO.id.id}`);
  }

  async unreserveStock(orderIdDTO: SyncOrderIdDTO): Promise<void> {
    const orderId = await this.dataMapper.syncOrderIdToDomain(orderIdDTO);
    await this.ordersService.syncUnreserveStock(orderId);
    this.logger.log(`[AggregateO] Quantità riservate azzerate per l'ordine: ${orderIdDTO.id}`);
  }

  async syncAddSellOrder(sellOrderDTO: SyncSellOrderDTO): Promise<void> {
    this.logger.log("[AggregateO] Ricevuto nuovo SellOrder,", JSON.stringify(sellOrderDTO, null, 2));
    const sellOrderDomain = await this.dataMapper.syncSellOrderToDomain(sellOrderDTO);
    await this.ordersService.syncCreateSellOrder(sellOrderDomain);
  }

  async syncAddInternalOrder(internalOrderDTO: SyncInternalOrderDTO): Promise<void> {
    this.logger.log("[AggregateO] Ricevuto nuovo InternalOrder,", JSON.stringify(internalOrderDTO, null, 2));
    const internalOrderDomain = await this.dataMapper.syncInternalOrderToDomain(internalOrderDTO);
    await this.ordersService.syncCreateInternalOrder(internalOrderDomain);
  }

  async updateOrderState(orderId: string, orderState: string): Promise<void> {
    const orderIdDTO: SyncOrderIdDTO = { id: orderId };
    const orderStateDTO: SyncOrderStateDTO = { orderState };
    
    const orderIdDomain = await this.dataMapper.syncOrderIdToDomain(orderIdDTO);
    const orderStateDomain = await this.dataMapper.syncOrderStateToDomain(orderStateDTO);
    
    await this.ordersService.syncUpdateOrderState(orderIdDomain, orderStateDomain);
    this.logger.log(`[AggregateO] Lo stato dell'ordine con ID ${orderId} è stato aggiornato con successo a ${orderState}`);
  }

  async cancelOrder(orderId: string): Promise<void> {
    const orderIdDTO: SyncOrderIdDTO = { id: orderId };
    const orderIdDomain = await this.dataMapper.syncOrderIdToDomain(orderIdDTO);
    await this.ordersService.syncCancelOrder(orderIdDomain);
  }

  async completeOrder(orderId: string): Promise<void> {
    const orderIdDTO: SyncOrderIdDTO = { id: orderId };
    const orderIdDomain = await this.dataMapper.syncOrderIdToDomain(orderIdDTO);
    await this.ordersService.syncUpdateOrderState(orderIdDomain, SyncOrderState.COMPLETED);
  }

  async getOrderState(orderId: string): Promise<SyncOrderStateDTO> {
    const orderIdDTO: SyncOrderIdDTO = { id: orderId };
    const orderIdDomain = await this.dataMapper.syncOrderIdToDomain(orderIdDTO);
    const receivedState = await this.cloudOrdersRepositoryMongo.getState(orderIdDomain);
    return await this.dataMapper.syncOrderStateToDTO(receivedState);
  }

  async getOrder(orderId: string): Promise<SyncInternalOrderDTO | SyncSellOrderDTO> {
    const orderIdDTO: SyncOrderIdDTO = { id: orderId };
    const orderIdDomain = await this.dataMapper.syncOrderIdToDomain(orderIdDTO);
    const receivedOrder = await this.cloudOrdersRepositoryMongo.getById(orderIdDomain);
    
    if (receivedOrder instanceof SyncInternalOrder) {
      return await this.dataMapper.syncInternalOrderToDTO(receivedOrder);
    }
    if (receivedOrder instanceof SyncSellOrder) {
      return await this.dataMapper.syncSellOrderToDTO(receivedOrder);
    }
    throw new Error(`[AggregateO] Tipo di ordine non riconosciuto per l'ordine: ${orderId}`);
  }

  async getAllFilteredOrders(): Promise<SyncOrdersDTO> {
      try {
          const ordersDomain = await this.cloudOrdersRepositoryMongo.getAllFilteredOrders();
          this.logger.log('[Adapter] Ordini filtrati recuperati dal repository');
          
          const ordersDTO = await this.dataMapper.syncOrdersToDTO(ordersDomain);
          this.logger.log('[Adapter] Conversione a DTO completata');
          
          return ordersDTO;
      } catch (error) {
          this.logger.log('[Adapter] Errore in getAllFilteredOrders:', error);
          // Restituisci un DTO vuoto invece di propagare l'errore
          return {
              sellOrders: [],
              internalOrders: []
          };
      }
  }

  async getAllOrders(): Promise<SyncOrdersDTO> {
     
      try {
          const ordersDomain = await this.cloudOrdersRepositoryMongo.getAllOrders();
          this.logger.log('[Adapter] Ordini recuperati dal repository');
          
          const ordersDTO = await this.dataMapper.syncOrdersToDTO(ordersDomain);
          this.logger.log('[Adapter] Conversione a DTO completata');
          
          return ordersDTO;
      } catch (error) {
          this.logger.log('[Adapter] Errore in getAllOrders:', error);
          // Restituisci un DTO vuoto invece di propagare l'errore
          return {
              sellOrders: [],
              internalOrders: []
          };
      }
  }
}