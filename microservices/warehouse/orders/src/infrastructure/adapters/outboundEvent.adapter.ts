import { MessagePattern } from '@nestjs/microservices';
import { OrdersService } from 'src/application/orders.service';

import { Order } from "src/domain/order.entity";
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

async receiveShipment(orderId: OrderId, items: OrderItem[], destination: number): Promise<void> {

}

async publishStockRepl(orderId: OrderId, items: OrderItem[]): Promise<void> {

}

async orderUpdated(order: Order): Promise<void> {

}

async orderCancelled(orderId: OrderId, warehouse: number): Promise<void> {

}

async orderCompleted(orderId: OrderId, warehouse: number): Promise<void> {

}

async publishInternalOrder(internalOrder: InternalOrder): Promise<void> {

}

async publishInternalOrderCopy(internalOrder: InternalOrder, warehouse: number): Promise<void> {

}

async publishSellOrder(sellOrder: SellOrder): Promise<void> {

}

async publishSellOrderCopy(sellOrder: SellOrder, warehouse: number): Promise<void> {

}


}