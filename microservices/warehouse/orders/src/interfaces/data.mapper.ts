import { OrderItem } from "src/domain/orderItem.entity";
import { OrderItemDetail } from "src/domain/orderItemDetail.entity";
import { OrderState } from "src/domain/orderState.enum";

import { OrderId } from "src/domain/orderId.entity";
import { InternalOrder } from "src/domain/internalOrder.entity";
import { SellOrder } from "src/domain/sellOrder.entity";

import { OrderItemDTO } from "src/interfaces/dto/orderItem.dto";
import { OrderItemDetailDTO } from "src/interfaces/dto/orderItemDetail.dto";
import { OrderStateDTO } from "src/interfaces/dto/orderState.dto";

import { OrderIdDTO } from "src/interfaces/dto/orderId.dto";
import { InternalOrderDTO } from "src/interfaces/dto/internalOrder.dto";
import { SellOrderDTO } from "src/interfaces/dto/sellOrder.dto";

import { OrdersController } from "./orders.controller";
import { OutboundEventAdapter } from "src/infrastructure/adapters/outboundEvent.adapter";


export class DataMapper {
    constructor(private readonly ordersController: OrdersController, 
                private readonly outboundEventAdapter: OutboundEventAdapter) {}

async InternalOrderToDomain(internalOrderDTO: InternalOrderDTO): Promise<InternalOrder> {

}

async SellOrderToDomain(sellOrderDTO: SellOrderDTO): Promise<SellOrder> {

}

async OrderItemToDomain(item: OrderItemDTO): Promise<OrderItem> {

}

async OrderIdToDomain(orderId: OrderIdDTO): Promise<OrderId> {

}

async OrderStateToDomain(state: OrderStateDTO): Promise<OrderState> {

}

async OrderItemDetailToDomain(orderItemDetailDTO: OrderItemDetailDTO): Promise<OrderItemDetail> {

}

async InternalOrderToDTO(order: InternalOrder): Promise<InternalOrderDTO> {

}

async SellOrderToDTO(order: SellOrder): Promise<SellOrderDTO> {

}

async OrderItemToDTO(order: OrderItem): Promise<OrderItemDTO> {

}

async OrderIdToDTO(orderId: OrderId): Promise<OrderIdDTO> {

}

async OrderStateToDTO(state: OrderState): Promise<OrderStateDTO> {

}

async OrderItemDetailToDTO(order: OrderItemDetail): Promise<OrderItemDetailDTO> {

}

async OrderQuantityToDTO(orderId: OrderId, items: OrderItem[]): Promise<OrderQuantityDTO> {

}

}
