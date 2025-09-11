import { Inject } from '@nestjs/common';
import { OrdersRepositoryMongo } from '../../infrastructure/adapters/mongodb/orders.repository.impl';
import { OutboundEventAdapter } from '../../infrastructure/adapters/outboundEvent.adapter';
import { OrderId } from "src/domain/orderId.entity";
import { Injectable } from '@nestjs/common';

@Injectable()
export class OrderSaga {
    constructor(
    @Inject('ORDERSREPOSITORY')
    private readonly ordersRepositoryMongo: OrdersRepositoryMongo,
    private readonly outboundEventAdapter: OutboundEventAdapter
    ) {}

    async startSellOrderSaga(orderId: OrderId): Promise<void> {
        const order = await this.ordersRepositoryMongo.getById(orderId);
        // Estrai gli OrderItem dagli OrderItemDetail
        const items = order.getItemsDetail().map(itemDetail => 
            itemDetail.getItem()
        );
        await this.outboundEventAdapter.publishReserveStock(orderId, items);
    }

    async startInternalOrderSaga(orderId: OrderId): Promise<void>{
        const order = await this.ordersRepositoryMongo.getById(orderId);
        // Estrai gli OrderItem dagli OrderItemDetail
        const items = order.getItemsDetail().map(itemDetail => 
            itemDetail.getItem()
        );
        
        await this.outboundEventAdapter.publishReserveStock(orderId, items);
    }


    }