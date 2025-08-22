import { MessagePattern } from '@nestjs/microservices';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { connect, NatsConnection, JSONCodec } from 'nats';

import { OrdersService } from 'src/application/orders.service';
import { DataMapper } from '../../interfaces/data.mapper';

import { Order } from "src/domain/order.entity";
import { Orders } from "src/domain/orders.entity";
import { OrderItem } from "src/domain/orderItem.entity";
import { OrderItemDetail } from "src/domain/orderItemDetail.entity";
import { OrderState } from "src/domain/orderState.enum";

import { OrderId } from "src/domain/orderId.entity";
import { InternalOrder } from "src/domain/internalOrder.entity";
import { SellOrder } from "src/domain/sellOrder.entity";

// Tutta la parte in cui mette NATS non penso sia definitiva, dato che NATS va gestito altrove
export class OutboundEventAdapter implements OnModuleDestroy{ 
  private readonly logger = new Logger(OutboundEventAdapter.name);
  private nc: NatsConnection;
  private codec = JSONCodec();

  constructor(private readonly ordersService: OrdersService,
      private readonly dataMapper: DataMapper) {
        this.init();
      }

  private async init() {
    // Connessione a NATS
    this.nc = await connect({ servers: 'nats://localhost:4222' });
    this.logger.log('✅ Connesso a NATS');
  }

  async onModuleDestroy() {
    await this.nc?.drain();
  }

  private async publishEvent<T>(subject: string, payload: T): Promise<void> {
    try {
      const data = this.codec.encode(payload);
      this.nc.publish(subject, data);
      this.logger.log(`Evento [${subject}] pubblicato`);
    } catch (err) {
      this.logger.error(`Errore pubblicando evento [${subject}]:`, err);
      throw err;
    }
  }

  async publishReserveStock(orderId: OrderId, items: OrderItem[]) {
    await this.publishEvent('orders.reserve_stock', { orderId: orderId.getId(), items });
  }

  async publishShipment(orderId: OrderId, items: OrderItem[]) {
    await this.publishEvent('orders.shipment', { orderId: orderId.getId(), items });
  }

  async receiveShipment(orderId: OrderId, items: OrderItem[], destination: number) {
    await this.publishEvent('orders.receive_shipment', { orderId: orderId.getId(), items, destination });
  }

  async publishStockRepl(orderId: OrderId, items: OrderItem[]) {
    await this.publishEvent('orders.stock_replenish', { orderId: orderId.getId(), items });
  }

  async orderUpdated(order: Order) {
    await this.publishEvent('orders.updated', order);
  }

  async orderCancelled(orderId: OrderId, warehouse: number) {
    await this.publishEvent('orders.cancelled', { orderId: orderId.getId(), warehouse });
  }

  async orderCompleted(orderId: OrderId, warehouse: number) {
    await this.publishEvent('orders.completed', { orderId: orderId.getId(), warehouse });
  }

  async publishInternalOrder(internalOrder: InternalOrder) {
    await this.publishEvent('orders.internal', internalOrder);
  }

  async publishInternalOrderCopy(internalOrder: InternalOrder, warehouse: number) {
    await this.publishEvent('orders.internal_copy', { ...internalOrder, warehouse });
  }

  async publishSellOrder(sellOrder: SellOrder) {
    await this.publishEvent('orders.sell', sellOrder);
  }

  async publishSellOrderCopy(sellOrder: SellOrder, warehouse: number) {
    await this.publishEvent('orders.sell_copy', { ...sellOrder, warehouse });
  }

}