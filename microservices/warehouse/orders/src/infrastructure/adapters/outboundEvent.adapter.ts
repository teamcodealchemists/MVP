import { MessagePattern } from '@nestjs/microservices';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { connect, NatsConnection, JSONCodec } from 'nats';
import { NatsService } from '../../interfaces/nats/nats.service';

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

@Injectable()
export class OutboundEventAdapter { 
  constructor(private readonly ordersService: OrdersService,
    private readonly natsService: NatsService,
      private readonly dataMapper: DataMapper) {}

  async publishReserveStock(orderId: OrderId, items: OrderItem[]) {
    await this.natsService.publish('orders.reserve_stock', { orderId: orderId.getId(), items });
  }

  async publishShipment(orderId: OrderId, items: OrderItem[]) {
    await this.natsService.publish('orders.shipment', { orderId: orderId.getId(), items });
  }

  async receiveShipment(orderId: OrderId, items: OrderItem[], destination: number) {
    await this.natsService.publish('orders.receive_shipment', { orderId: orderId.getId(), items, destination });
  }

  async publishStockRepl(orderId: OrderId, items: OrderItem[]) {
    await this.natsService.publish('orders.stock_replenish', { orderId: orderId.getId(), items });
  }

  async orderUpdated(order: Order) {
    await this.natsService.publish('orders.updated', order);
  }

  async orderCancelled(orderId: OrderId, warehouse: number) {
    await this.natsService.publish('orders.cancelled', { orderId: orderId.getId(), warehouse });
  }

  async orderCompleted(orderId: OrderId, warehouse: number) {
    await this.natsService.publish('orders.completed', { orderId: orderId.getId(), warehouse });
  }

  async publishInternalOrder(internalOrder: InternalOrder) {
    await this.natsService.publish('orders.internal', internalOrder);
  }

  async publishInternalOrderCopy(internalOrder: InternalOrder, warehouse: number) {
    await this.natsService.publish('orders.internal_copy', { ...internalOrder, warehouse });
  }

  async publishSellOrder(sellOrder: SellOrder) {
    await this.natsService.publish('orders.sell', sellOrder);
  }

  async publishSellOrderCopy(sellOrder: SellOrder, warehouse: number) {
    await this.natsService.publish('orders.sell_copy', { ...sellOrder, warehouse });
  }

}