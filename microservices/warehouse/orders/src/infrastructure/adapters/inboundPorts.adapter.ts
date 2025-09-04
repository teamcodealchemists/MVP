import { Injectable, Inject } from '@nestjs/common';
import { OrdersService } from 'src/application/orders.service';
import { DataMapper } from '../../infrastructure/mappers/data.mapper';
import { OrdersRepository } from 'src/domain/orders.repository';

// Use Cases
import { GetAllOrdersUseCase } from '../../interfaces/inbound-ports/getAllOrders.useCase';
import { GetOrderUseCase } from '../../interfaces/inbound-ports/getOrder.useCase';
import { GetOrderStateUseCase } from '../../interfaces/inbound-ports/getOrderState.useCase';
import { UpdateOrderStateUseCase } from '../../interfaces/inbound-ports/updateOrderState.useCase';

// Event Listeners
import { InternalOrderEventListener } from '../../interfaces/inbound-ports/internalOrderEvent.listener';
import { OrderStatusEventListener } from '../../interfaces/inbound-ports/orderStatusEvent.listener';
import { ReservationEventListener } from '../../interfaces/inbound-ports/reservationEvent.listener';
import { SellOrderEventListener } from '../../interfaces/inbound-ports/sellOrderEvent.listener';
import { ShipmentEventListener } from '../../interfaces/inbound-ports/shipmentEvent.listener';

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


@Injectable()
export class InboundPortsAdapter implements 
  GetAllOrdersUseCase, 
  GetOrderUseCase, 
  GetOrderStateUseCase, 
  InternalOrderEventListener, 
  OrderStatusEventListener, 
  ReservationEventListener,
  SellOrderEventListener, 
  ShipmentEventListener, 
  UpdateOrderStateUseCase {

  constructor(
    private readonly ordersService: OrdersService,
    private readonly dataMapper: DataMapper,
    @Inject('ORDERSREPOSITORY')
    private readonly ordersRepository: OrdersRepository
  ) {}

  async stockReserved(orderQuantityDTO: OrderQuantityDTO): Promise<void> {
    const orderId = await this.dataMapper.orderIdToDomain(orderQuantityDTO.id);
    const orderItems = await Promise.all(
      orderQuantityDTO.items.map(itemDTO => this.dataMapper.orderItemToDomain(itemDTO))
    );
    await this.ordersService.updateReservedStock(orderId, orderItems);
  }

  async addSellOrder(sellOrderDTO: SellOrderDTO): Promise<void> {
    const sellOrderDomain = await this.dataMapper.sellOrderToDomain(sellOrderDTO);
    await this.ordersService.createSellOrder(sellOrderDomain);
  }

  async addInternalOrder(internalOrderDTO: InternalOrderDTO): Promise<void> {
    const internalOrderDomain = await this.dataMapper.internalOrderToDomain(internalOrderDTO);
    await this.ordersService.createInternalOrder(internalOrderDomain);
  }

  async waitingForStock(orderId: string): Promise<void> {
    const orderIdDTO: OrderIdDTO = { id: orderId };
    const orderIdDomain = await this.dataMapper.orderIdToDomain(orderIdDTO);
    await this.ordersService.updateOrderState(orderIdDomain, OrderState.PROCESSING);
  }

  async stockShipped(orderId: string): Promise<void> {
    const orderIdDTO: OrderIdDTO = { id: orderId };
    const orderIdDomain = await this.dataMapper.orderIdToDomain(orderIdDTO);
    await this.ordersService.updateOrderState(orderIdDomain, OrderState.SHIPPED);
  }

  async stockReceived(orderIdDTO: OrderIdDTO): Promise<void> {
    const orderId = await this.dataMapper.orderIdToDomain(orderIdDTO);
    await this.ordersService.receiveOrder(orderId);
  }

  async replenishmentReceived(orderIdDTO: OrderIdDTO): Promise<void> {
    const orderId = await this.dataMapper.orderIdToDomain(orderIdDTO);
    await this.ordersService.completeOrder(orderId);
  }

  async updateOrderState(orderId: string, orderState: string): Promise<void> {
    const orderIdDTO: OrderIdDTO = { id: orderId };
    const orderStateDTO: OrderStateDTO = { orderState };
    
    const orderIdDomain = await this.dataMapper.orderIdToDomain(orderIdDTO);
    const orderStateDomain = await this.dataMapper.orderStateToDomain(orderStateDTO);
    
    await this.ordersService.updateOrderState(orderIdDomain, orderStateDomain);
  }

  async cancelOrder(orderId: string): Promise<void> {
    const orderIdDTO: OrderIdDTO = { id: orderId };
    const orderIdDomain = await this.dataMapper.orderIdToDomain(orderIdDTO);
    await this.ordersService.cancelOrder(orderIdDomain);
  }

  async completeOrder(orderId: string): Promise<void> {
    const orderIdDTO: OrderIdDTO = { id: orderId };
    const orderIdDomain = await this.dataMapper.orderIdToDomain(orderIdDTO);
    await this.ordersService.completeOrder(orderIdDomain);
  }

  async getOrderState(orderId: string): Promise<OrderStateDTO> {
    const orderIdDTO: OrderIdDTO = { id: orderId };
    const orderIdDomain = await this.dataMapper.orderIdToDomain(orderIdDTO);
    const receivedState = await this.ordersRepository.getState(orderIdDomain);
    return await this.dataMapper.orderStateToDTO(receivedState);
  }

  async getOrder(orderId: string): Promise<InternalOrderDTO | SellOrderDTO> {
    const orderIdDTO: OrderIdDTO = { id: orderId };
    const orderIdDomain = await this.dataMapper.orderIdToDomain(orderIdDTO);
    const receivedOrder = await this.ordersRepository.getById(orderIdDomain);
    
    if (receivedOrder instanceof InternalOrder) {
      return await this.dataMapper.internalOrderToDTO(receivedOrder);
    }
    if (receivedOrder instanceof SellOrder) {
      return await this.dataMapper.sellOrderToDTO(receivedOrder);
    }
    throw new Error(`Tipo di ordine non riconosciuto per l'ordine: ${orderId}`);
  }

  async getAllOrders(): Promise<OrdersDTO> {
    const ordersDomain = await this.ordersRepository.getAllOrders();
    return await this.dataMapper.ordersToDTO(ordersDomain);
  }
}