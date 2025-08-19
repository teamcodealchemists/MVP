import { MessagePattern } from '@nestjs/microservices';
import { OrdersService } from 'src/application/orders.service';

import { Orders } from "src/domain/orders.entity";
import { OrderItem } from "src/domain/orderItem.entity";
import { OrderItemDetail } from "src/domain/orderItemDetail.entity";
import { OrderState } from "src/domain/orderState.enum";

import { OrderId } from "src/domain/orderId.entity";
import { InternalOrder } from "src/domain/internalOrder.entity";
import { SellOrder } from "src/domain/sellOrder.entity";


export class OutboundEventAdapter {
  constructor(private readonly ordersService: OrdersService) {}

async publishReserveStock(orderId: OrderId, items: OrderItem[]): Promise<void> {

}

async publishShipment(orderId: OrderId, items: OrderItem[]): Promise<void> {

}

async receiveShipment(orderId: OrderId, items: OrderItem[]): Promise<void> {

}

async publishStockRepl(orderId: OrderId, items: OrderItem[]): Promise<void> {

}

async orderCancelled(orderId: OrderId): Promise<void> {

}

async orderCompleted(orderId: OrderId): Promise<void> {

}

async publishInternalOrder(internalOrder: InternalOrder): Promise<void> {

}

async publishSellOrder(sellOrder: SellOrder): Promise<void> {

}

}