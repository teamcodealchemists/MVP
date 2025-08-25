import { OrdersRepository } from "src/domain/orders.repository";
import { Orders } from "src/domain/orders.entity";
import { OrderItem } from "src/domain/orderItem.entity";
import { OrderState } from "src/domain/orderState.enum";

import { OrderId } from "src/domain/orderId.entity";
import { InternalOrder } from "src/domain/internalOrder.entity";
import { SellOrder } from "src/domain/sellOrder.entity";

import { Injectable } from "@nestjs/common";

@Injectable()
export class OrdersRepositoryMongo implements OrdersRepository {
    // Implement the methods defined in the OrdersRepository interface

    async getById(id: OrderId): Promise<InternalOrder | SellOrder> {
        // Implementation for getting an order by ID from MongoDB

        return Promise.resolve(new InternalOrder(new OrderId("I-12345"), [], OrderState.PENDING, new Date(), 0, 1));
    }

/*  async getState(id: OrderId): Promise<OrderState> {

        
    }

    async getAllOrders(): Promise<Orders> {
        // Implementation for getting all orders from MongoDB
    }

    async addSellOrder(order: SellOrder): Promise<void> {
        // Implementation for getting all sell orders from MongoDB
    }

    async addInternalOrder(order: InternalOrder): Promise<void> {
        // Implementation for getting all internal orders from MongoDB
    }

    async removeById(id: OrderId): Promise<boolean> {
        // Implementation for removing an order by ID in MongoDB
    }

    async updateOrderState(id: OrderId, state: OrderState): Promise<InternalOrder | SellOrder> {
        // Implementation for updating the state of an order by its ID  in MongoDB
    }

    async genUniqueId(): Promise<OrderId> {
        // Implementation for generating a unique ID for a new order to be created in MongoDB
    }

    async updateReservedStock(id: OrderId, items: OrderItem[]): Promise<InternalOrder | SellOrder> {
        // Implementation for updating the quantityReserved of an Item for an order in MongoDB
    }
 */
}
