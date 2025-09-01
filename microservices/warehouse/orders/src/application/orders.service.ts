import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Orders } from "src/domain/orders.entity";
import { OrderItem } from "src/domain/orderItem.entity";
import { OrderItemDetail } from "src/domain/orderItemDetail.entity";
import { OrderState } from "src/domain/orderState.enum";

import { OrderId } from "src/domain/orderId.entity";
import { InternalOrder } from "src/domain/internalOrder.entity";
import { SellOrder } from "src/domain/sellOrder.entity";
import { OrdersRepositoryMongo } from '../infrastructure/adapters/mongodb/orders.repository.impl';
import { OutboundEventAdapter } from '../infrastructure/adapters/outboundEvent.adapter';

@Injectable()   
export class OrdersService {
    constructor(
    @Inject('ORDERSREPOSITORY')
    private readonly ordersRepositoryMongo: OrdersRepositoryMongo,
    private readonly outboundEventAdapter: OutboundEventAdapter
    ) {}

    async checkOrderExistence(id: OrderId): Promise<boolean>{
        const order = await this.ordersRepositoryMongo.getById(id);
        if(!order) {
            return Promise.resolve(false);
        }
        return Promise.resolve(true);   
    }

/*     async updateOrderState(id: OrderId, state: OrderState): Promise<void> {
        await this.ordersRepositoryMongo.updateOrderState(id, state);
    } */

    async updateOrderState(id: OrderId, state: OrderState): Promise<void> {
        // Aggiorna lo stato nella repository
        await this.ordersRepositoryMongo.updateOrderState(id, state);
        
        // Recupera l'ordine aggiornato
        const updatedOrder = await this.ordersRepositoryMongo.getById(id);
        
        // Invia sync all'aggregato Orders
        const reqReceiver = { destination: 'aggregate' as const};

        if (updatedOrder instanceof SellOrder) {
            await this.outboundEventAdapter.publishSellOrder(updatedOrder, reqReceiver);
        } else if (updatedOrder instanceof InternalOrder) {
            await this.outboundEventAdapter.publishInternalOrder(updatedOrder, reqReceiver);
        }
    }    
    
    async checkOrderState(id: OrderId): Promise<void> {
        await this.ordersRepositoryMongo.getState(id);
    }

    async createSellOrder(order: SellOrder): Promise<void>{
        const uniqueOrderId = await this.ordersRepositoryMongo.genUniqueId('S');
        
        // Creo un nuovo SellOrder con stesso contenuto ma nuovo ID
        const orderWithUniqueId = new SellOrder(
            uniqueOrderId,
            order.getItemsDetail(),
            order.getOrderState(),
            order.getCreationDate(),
            order.getWarehouseDeparture(),
            order.getDestinationAddress()
        );

        await this.ordersRepositoryMongo.addSellOrder(orderWithUniqueId);
        // fare check ResQ così da far partire saga?
    }

    async createInternalOrder(order: InternalOrder): Promise<void>{
        const uniqueOrderId = await this.ordersRepositoryMongo.genUniqueId('I');
        
        // Creo un nuovo InternalOrder con stesso contenuto ma nuovo ID
        const orderWithUniqueId = new InternalOrder(
            uniqueOrderId,
            order.getItemsDetail(),
            order.getOrderState(),
            order.getCreationDate(),
            order.getWarehouseDeparture(),
            order.getWarehouseDestination()
        );

        await this.ordersRepositoryMongo.addInternalOrder(orderWithUniqueId);
        // fare check ResQ così da far partire saga?
    }

    async cancelOrder(id: OrderId): Promise<void> {
        await this.ordersRepositoryMongo.removeById(id);
    }

    async updateReservedStock(id: OrderId, items: OrderItem[]): Promise<void> {
        await this.ordersRepositoryMongo.updateReservedStock(id, items);
        // fare check ResQuantity = Quantity e, se no , far partire saga?

    }

    async checkReservedQuantityForSellOrder(sellOrder: SellOrder): Promise<void> {
        await this.ordersRepositoryMongo.checkReservedQuantityForSellOrder(sellOrder);
    }

    async checkReservedQuantityForInternalOrder(internalOrder: InternalOrder): Promise<void> {
        await this.ordersRepositoryMongo.checkReservedQuantityForInternalOrder(internalOrder);
    }

    async shipOrder(id: OrderId): Promise<void> {
        await this.ordersRepositoryMongo.updateOrderState(id, OrderState.SHIPPED);

        console.log(`Order n° ${id} shipped!`);
    }

    async receiveOrder(id: OrderId): Promise<void> {
/*         await this.ordersRepositoryMongo.getById(id);        
          // Comunica direttamente con Outbound?

        console.log(`Order n° ${id} received!`); */
    }

    async completeOrder(id: OrderId): Promise<void> {
        await this.ordersRepositoryMongo.updateOrderState(id, OrderState.COMPLETED);
        console.log(`Replenishment order n° ${id} completed!`);
    }

}