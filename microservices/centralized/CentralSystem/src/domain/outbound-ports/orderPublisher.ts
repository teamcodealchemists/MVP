import { InternalOrder } from "../internalOrder.entity";

export interface OrderPublisher {
  createInternalOrder(order: InternalOrder): void;
}
