import { OrderItem } from "src/domain/orderItem.entity";
import { OrderItemDetail } from "src/domain/orderItemDetail.entity";
import { OrderState } from "src/domain/orderState.enum";

import { OrderId } from "src/domain/orderId.entity";
import { InternalOrder } from "src/domain/internalOrder.entity";
import { SellOrder } from "src/domain/sellOrder.entity";
import { Orders } from "src/domain/orders.entity";

import { OrderItemDTO } from "src/interfaces/dto/orderItem.dto";
import { OrderItemDetailDTO } from "src/interfaces/dto/orderItemDetail.dto";
import { OrderStateDTO } from "src/interfaces/dto/orderState.dto";

import { OrderIdDTO } from "src/interfaces/dto/orderId.dto";
import { InternalOrderDTO } from "src/interfaces/dto/internalOrder.dto";
import { SellOrderDTO } from "src/interfaces/dto/sellOrder.dto";
import { OrdersDTO } from "src/interfaces/dto/orders.dto";

import { OrdersController } from "./orders.controller";
import { OutboundEventAdapter } from "src/infrastructure/adapters/outboundEvent.adapter";


export class DataMapper {
    constructor(private readonly ordersController: OrdersController, 
                private readonly outboundEventAdapter: OutboundEventAdapter) {}

async internalOrderToDomain(internalOrderDTO: InternalOrderDTO): Promise<InternalOrder> {

}

async sellOrderToDomain(sellOrderDTO: SellOrderDTO): Promise<SellOrder> {

}

async orderItemToDomain(item: OrderItemDTO): Promise<OrderItem> {

}

async orderIdToDomain(orderId: OrderIdDTO): Promise<OrderId> {

}

async orderStateToDomain(state: OrderStateDTO): Promise<OrderState> {

}

async orderItemDetailToDomain(orderItemDetailDTO: OrderItemDetailDTO): Promise<OrderItemDetail> {

}

async internalOrderToDTO(order: InternalOrder): Promise<InternalOrderDTO> {

}

async sellOrderToDTO(order: SellOrder): Promise<SellOrderDTO> {

}

async orderItemToDTO(order: OrderItem): Promise<OrderItemDTO> {

}

async orderIdToDTO(orderId: OrderId): Promise<OrderIdDTO> {

}

async orderStateToDTO(state: OrderState): Promise<OrderStateDTO> {

}

async orderItemDetailToDTO(order: OrderItemDetail): Promise<OrderItemDetailDTO> {

}

async orderQuantityToDTO(orderId: OrderId, items: OrderItem[]): Promise<OrderQuantityDTO> {

}

async ordersToDTO(orders: Orders): Promise<OrdersDTO> {

}

}
