import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Orders } from "src/domain/orders.entity";
import { OrderItem } from "src/domain/orderItem.entity";
import { OrderItemDetail } from "src/domain/orderItemDetail.entity";
import { OrderState } from "src/domain/orderState.enum";

import { OrderId } from "src/domain/orderId.entity";
import { InternalOrder } from "src/domain/internalOrder.entity";
import { SellOrder } from "src/domain/sellOrder.entity";
import { OrdersRepositoryMongo } from '../infrastructure/adapters/mongodb/orders.repository.impl';

@Injectable()   
export class OrdersService {
    constructor(
    @Inject('ORDERS_REPOSITORY')
    private readonly ordersRepositoryMongo: OrdersRepositoryMongo,
    ) {}

    async checkOrderExistence(id: OrderId): Promise<boolean>{
        const order = await this.ordersRepositoryMongo.getById(id);
        if(!order) {
            return Promise.resolve(false);
        }
        return Promise.resolve(true);   
    }

    async updateOrderState(id: OrderId, state: OrderState): Promise<void> {
        await this.ordersRepositoryMongo.updateOrderState(id, state);
    }
    
    async checkOrderState(id: OrderId): Promise<void> {
        await this.ordersRepositoryMongo.getState(id);
    }

    async createSellOrder(order: SellOrder): Promise<void>{
        await this.ordersRepositoryMongo.addSellOrder(order);
    }

    async createInternalOrder(order: InternalOrder): Promise<void>{
        await this.ordersRepositoryMongo.addInternalOrder(order);
    }

    async cancelOrder(id: OrderId): Promise<void> {
        await this.ordersRepositoryMongo.removeById(id);
    }

    async updateReservedStock(id: OrderId, items: OrderItem[]): Promise<void> {
        await this.ordersRepositoryMongo.updateReservedStock(id, items);
    }

    async checkReservedQuantityForSellOrder(sellOrder: SellOrder): Promise<void> {
        await this.ordersRepositoryMongo.checkReservedQuantityForSellOrder(sellOrder);
    }

    async checkReservedQuantityForInternalOrder(internalOrder: InternalOrder): Promise<void> {
        await this.ordersRepositoryMongo.checkReservedQuantityForInternalOrder(internalOrder);
    }

    async shipOrder(id: OrderId): Promise<void> {
        await this.ordersRepositoryMongo.updateOrderState(id, OrderState.SHIPPED);
    }

    async receiveOrder(id: OrderId): Promise<void> {
/*         await this.ordersRepositoryMongo.getById(id);     */    
          // Comunica direttamente con Outbound?
}

    async completeOrder(id: OrderId): Promise<void> {
        await this.ordersRepositoryMongo.updateOrderState(id, OrderState.COMPLETED);
    }

}