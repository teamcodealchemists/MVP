import { InternalOrder } from "../internalOrder.entity";
import { OrderId } from "../orderId.entity";

export interface OrderPublisher {
  createInternalOrder(order: InternalOrder, sellOrder : OrderId): void;
}
