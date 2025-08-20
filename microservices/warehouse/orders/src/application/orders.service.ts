import { Injectable, Inject, NotFoundException } from '@nestjs/common';

import { Orders } from "src/domain/orders.entity";
import { OrderItem } from "src/domain/orderItem.entity";
import { OrderItemDetail } from "src/domain/orderItemDetail.entity";
import { OrderState } from "src/domain/orderState.enum";

import { OrderId } from "src/domain/orderId.entity";
import { InternalOrder } from "src/domain/internalOrder.entity";
import { SellOrder } from "src/domain/sellOrder.entity";
import { OrdersRepository } from 'src/infrastructure/adapters/mongodb/orders.repository.module';

export class OrdersService {
    constructor(
        @Inject('ORDERSREPOSITORY') private readonly ordersRepository: OrdersRepository,
    ) {
        
    }

    async checkOrderExistence(id: OrderId): Promise<boolean>{

    }

    async updateOrderState(id: OrderId, state: OrderState): Promise<void> {

    }
    
    async checkOrderState(id: OrderId): Promise<void> {

    }

    async createSellOrder(order: SellOrder): Promise<void>{

    }

    async createInternalOrder(order: InternalOrder): Promise<void>{

    }

    async cancelOrder(id: OrderId): Promise<void> {

    }

    async updateReservedStock(id: OrderId, items: OrderItem[]): Promise<void> {

    }

    async checkReservedQuantityForSellOrder(sellOrder: SellOrder): Promise<void> {

    }

    async checkReservedQuantityForInternalOrder(internalOrder: InternalOrder): Promise<void> {

    }

    async shipOrder(id: OrderId): Promise<void> {

    }

    async receiveOrder(id: OrderId): Promise<void> {


    }

    async completeOrder(id: OrderId): Promise<void> {

    }


    async getHello(): Promise<string> {
        return (await this.ordersRepository.removeById(new ProductId("1"))).valueOf() ? "Hello" : "Goodbye";
    }
}