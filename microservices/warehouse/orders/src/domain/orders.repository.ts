import { OrderId } from "./orderId.entity";
import { OrderItem } from "./orderItem.entity";
import { OrderState } from "./orderState.enum";

import { Orders } from "./orders.entity";
import { InternalOrder } from "src/domain/internalOrder.entity";
import { SellOrder } from "src/domain/sellOrder.entity";


export interface OrdersRepository {
    getById(id: OrderId): Promise<InternalOrder | SellOrder>;
    getState(id: OrderId): Promise<OrderState>;
    getAllOrders(): Promise<Orders>;
    addSellOrder(order: SellOrder): Promise<void>;
    addInternalOrder(order: InternalOrder): Promise<void>;
    removeById(id: OrderId): Promise<boolean>;
    updateOrderState(id: OrderId, state: OrderState): Promise<InternalOrder | SellOrder>;
    genUniqueId(): Promise<OrderId>;
    updateReservedStock(id: OrderId, items: OrderItem[]): Promise<InternalOrder | SellOrder>
 }

export const OrdersRepository = Symbol("ORDERSREPOSITORY");