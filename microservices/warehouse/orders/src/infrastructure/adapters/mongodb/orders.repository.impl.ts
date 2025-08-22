import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";import { Order } from "src/domain/order.entity";

import { DataMapper } from "src/interfaces/data.mapper";
import { InternalOrderModel } from "./model/internalOrder.model";
import { SellOrderModel } from "./model/sellOrder.model";
import { OrderItemDetailModel } from "./model/orderItemDetail.model";

import { OrdersRepository } from "src/domain/orders.repository";
import { Orders } from "src/domain/orders.entity";
import { OrderItem } from "src/domain/orderItem.entity";
import { OrderState } from "src/domain/orderState.enum";

import { OrderId } from "src/domain/orderId.entity";
import { InternalOrder } from "src/domain/internalOrder.entity";
import { SellOrder } from "src/domain/sellOrder.entity";

@Injectable()
export class OrdersRepositoryMongo implements OrdersRepository {
  constructor(
    @InjectModel("InternalOrder") private readonly internalOrderModel: InternalOrderModel,
    @InjectModel("SellOrder") private readonly sellOrderModel: SellOrderModel,
    @InjectModel("OrderItemDetail") private readonly orderItemDetailModel: OrderItemDetailModel,
    private readonly mapper: DataMapper
  ) {}
  
    // Implement the methods defined in the OrdersRepository interface

    async getById(id: OrderId): Promise<InternalOrder | SellOrder> {
        const internal = await this.internalOrderModel.findOne({ "orderId.id": id.getId() }).lean();
        const sell = await this.sellOrderModel.findOne({ "orderId.id": id.getId() }).lean();
        
        if (internal) return this.mapper.internalOrderToDomain(internal as any);
        if (sell) return this.mapper.sellOrderToDomain(sell as any);

        throw new Error(`Non è stato trovato l'ordine con ID ${id.getId()}`);
    }

    async getState(id: OrderId): Promise<OrderState> {
        const internal = await this.internalOrderModel.findOne({ "orderId.id": id.getId() }, { orderState: 1 }).lean();
        const sell = await this.sellOrderModel.findOne({ "orderId.id": id.getId() }, { orderState: 1 }).lean();
        
        if (internal) return internal.orderState as OrderState;
        if (sell) return sell.orderState as OrderState;

        throw new Error(`State for order ID ${id.getId()} not found`);    
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
}
