import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { InternalOrderEventPublisher } from '../../interfaces/outbound-ports/internalOrderEvent.publisher';
import { OrderStatusEventPublisher } from '../../interfaces/outbound-ports/orderStatusEvent.publisher';
/* import { OrderUpdateEventPublisher } from '../../interfaces/outbound-ports/orderUpdateEvent.publisher'; */
import { RequestStockReplenishmentPublisher } from '../../interfaces/outbound-ports/requestStockReplenishment.publisher';
import { ReserveStockCommandPublisher } from '../../interfaces/outbound-ports/reserveStockCommand.publisher';
import { SellOrderEventPublisher } from '../../interfaces/outbound-ports/sellOrderEvent.publisher';
import { ShipStockCommandPublisher } from '../../interfaces/outbound-ports/shipStockCommand.publisher';

import { DataMapper } from '../../infrastructure/mappers/data.mapper';

import { OrderItem } from "src/domain/orderItem.entity";

import { OrderId } from "src/domain/orderId.entity";
import { InternalOrder } from "src/domain/internalOrder.entity";
import { SellOrder } from "src/domain/sellOrder.entity";
import { OrderState } from "src/domain/orderState.enum";
import { OrderIdDTO } from 'src/interfaces/dto/orderId.dto';
import { WaitingForStockPublisher } from 'src/interfaces/outbound-ports/waitingForStock.publisher';

@Injectable()
export class OutboundEventAdapter implements InternalOrderEventPublisher, OrderStatusEventPublisher, RequestStockReplenishmentPublisher, ReserveStockCommandPublisher,
  SellOrderEventPublisher, ShipStockCommandPublisher, OnModuleInit, WaitingForStockPublisher {
  constructor(
    @Inject("NATS_SERVICE") private readonly natsService: ClientProxy,
    private readonly dataMapper: DataMapper
  ) { }

  waitingForStock(orderId: OrderId, warehouseDepartureId: string): Promise<void> {
    this.natsService.emit(`event.warehouse.${warehouseDepartureId}.order.${orderId.getId()}.waitingStock`, "{}");
    this.logger.debug(`[2] Published waiting for stock event for order ${orderId.getId()} with warehouseDepartureId ${warehouseDepartureId}`);
    return Promise.resolve();
  }

  private readonly logger = new Logger(OutboundEventAdapter.name);

  async onModuleInit() {
    try {
      await this.natsService.connect();
      this.logger.log('Connected to NATS service');
    } catch (error) {
      this.logger.error('Error connecting to NATS service', error);
    }
  }

  // (Deduco) Corrisponde in PUB a STOCKRESERVED
  async publishReserveStock(orderId: OrderId, items: OrderItem[]) {
    const orderIdDTO = await this.dataMapper.orderIdToDTO(orderId);
    const itemsDTO = await Promise.all(items.map(item => this.dataMapper.orderItemToDTO(item)));

    // Invia alla porta handleOrderRequest in Inventory del magazzino stesso
    this.natsService.emit(`event.warehouse.${process.env.WAREHOUSE_ID}.order.request`, JSON.stringify({ orderIdDTO, itemsDTO }));
    this.logger.log(`Published reserve stock event for order ${orderId.getId()} with items: ${JSON.stringify(itemsDTO)}`);
  }


  async publishShipment(orderId: OrderId, items: OrderItem[]): Promise<void> {
    const orderIdDTO = await this.dataMapper.orderIdToDTO(orderId);
    const itemsDTO = await Promise.all(items.map(item => this.dataMapper.orderItemToDTO(item)));

    this.logger.debug(`🚚📦2️⃣ Preparing to ship order: ${orderIdDTO.id} with items: ${JSON.stringify(itemsDTO)}`);

    // Comunica a Inventario di spedire la merce
    await this.natsService.emit(
      `event.warehouse.${process.env.WAREHOUSE_ID}.inventory.ship.items`, JSON.stringify({ orderIdDTO, itemsDTO }));
  }

  async publishStockRepl(orderId: OrderId, items: OrderItem[]): Promise<void> {
    const orderIdDTO = await this.dataMapper.orderIdToDTO(orderId);
    const itemsDTO = await Promise.all(items.map(item => this.dataMapper.orderItemToDTO(item)));

    this.logger.debug(`🚚📦2️⃣ Preparing to riassortimento: ${orderIdDTO.id} with items: ${JSON.stringify(itemsDTO)}`);

    // Spedisce il compito a sistema centralizzato
    await this.natsService.emit(
      `event.warehouse.${process.env.WAREHOUSE_ID}.centralSystem.request`, JSON.stringify({ orderIdDTO, itemsDTO, warehouseId: process.env.WAREHOUSE_ID }));
    return Promise.resolve();
  }

  // Corrisponde in SUB a stockReceived()
  async receiveShipment(orderId: OrderId, items: OrderItem[], destination: number) {
    const orderIdDTO = await this.dataMapper.orderIdToDTO(orderId);
    const itemsDTO = await Promise.all(items.map(item => this.dataMapper.orderItemToDTO(item)));
    this.natsService.emit(`event.warehouse.${destination.toString()}.inventory.receiveShipment`, JSON.stringify({ orderIdDTO, itemsDTO }));
  }

  /* async orderUpdated(order: Order) {
      await this.natsService.publish('orders.updated', order);
    } 
  */

  async orderStateUpdated(orderId: OrderId, orderState: OrderState, context: { destination: 'aggregate' | 'warehouse', warehouseId?: number }) {
    try {
      const orderIdStr = orderId.getId();

      // Sincronizza con l'aggregato cloud Ordini
      if (context.destination === 'aggregate') {
        let aggregateSubject = `event.aggregate.order.${orderIdStr}.state.update.${orderState}`;
        await this.natsService.emit(aggregateSubject, "{}");
      }
      // Sincronizza con l'Ordini del warehouseDestination
      else if (context.destination === 'warehouse' && context.warehouseId) {
        let warehouseDestinationSubject = `event.warehouse.${context.warehouseId}.order.${orderIdStr}.state.update.${orderState}`;
        await this.natsService.emit(warehouseDestinationSubject, "{}");
      }

      return Promise.resolve();

    } catch (error) {
      console.error('Errore in orderStateUpdated:', error);
      throw error;
    }
  }

  async orderCancelled(orderId: OrderId) {
    try {
      const orderIdStr = orderId.getId();
      // Sincronizza con l'aggregato
      let aggregateSubject = `event.aggregate.order.${orderIdStr}.cancel`;
      await this.natsService.emit(aggregateSubject, "{}");

    } catch (error) {
      console.error('Errore in orderCancelled:', error);
      throw error;
    }
  }


  async orderCompleted(orderID: OrderId, warehouse: number) {
    try {
      const orderIdDTO = await this.dataMapper.orderIdToDTO(orderID);
      this.natsService.emit(`event.warehouse.${warehouse.toString()}.order.${orderIdDTO.id}.complete`, "{}");
      return Promise.resolve();
    } catch (error) {
      console.error('Errore in orderCompleted:', error);
      throw error;
    }
  }

  async publishInternalOrder(internalOrder: InternalOrder, context: { destination: 'aggregate' | 'warehouse', warehouseId?: number }) {

    const internalOrderDTO = await this.dataMapper.internalOrderToDTO(internalOrder);
    let subject: string;
    console.log("[outbound] Manda InternalOrder,", JSON.stringify(internalOrderDTO, null, 2));

    if (context.destination === 'aggregate') {
      subject = `event.aggregate.order.internal.new`;
      await this.natsService.emit(subject, JSON.stringify(internalOrderDTO));
    }
    else if (context.destination === 'warehouse' && context.warehouseId) {
      subject = `event.warehouse.${context.warehouseId}.order.internal.new`;
      await this.natsService.emit(subject, JSON.stringify(internalOrderDTO));
    }
  }


  async publishSellOrder(sellOrder: SellOrder, context: { destination: 'aggregate' | 'warehouse', warehouseId?: number }): Promise<string> {
    console.log("[outbound] Manda SellOrder,", JSON.stringify(sellOrder, null, 2));
    const sellOrderDTO = await this.dataMapper.sellOrderToDTO(sellOrder);
    let subject: string;

    if (context.destination === 'aggregate') {
      subject = `event.aggregate.order.sell.new`;
      await this.natsService.emit(subject, JSON.parse(JSON.stringify(sellOrderDTO)));
    }

    return Promise.resolve(JSON.stringify(sellOrder.getOrderId()));
  }

}