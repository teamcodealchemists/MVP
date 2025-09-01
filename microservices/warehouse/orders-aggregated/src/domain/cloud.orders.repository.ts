import { SyncOrderId } from "./syncOrderId.entity";
import { SyncOrderItem } from "./syncOrderItem.entity";
import { SyncOrderState } from "./syncOrderState.enum";

import { SyncOrders } from "./syncOrders.entity";
import { SyncInternalOrder } from "src/domain/syncInternalOrder.entity";
import { SyncSellOrder } from "src/domain/syncSellOrder.entity";


export interface CloudOrdersRepository {
    getById(id: SyncOrderId): Promise<SyncInternalOrder | SyncSellOrder>;
    getState(id: SyncOrderId): Promise<SyncOrderState>;
    getAllOrders(): Promise<SyncOrders>;
    syncAddSellOrder(order: SyncSellOrder): Promise<void>;
    syncAddInternalOrder(order: SyncInternalOrder): Promise<void>;
    syncRemoveById(id: SyncOrderId): Promise<boolean>;
    syncUpdateOrderState(id: SyncOrderId, state: SyncOrderState): Promise<SyncInternalOrder | SyncSellOrder>;
    syncUpdateReservedStock(id: SyncOrderId, items: SyncOrderItem[]): Promise<SyncInternalOrder | SyncSellOrder> 
}

export const OrdersRepository = Symbol("CLOUDORDERSREPOSITORY");