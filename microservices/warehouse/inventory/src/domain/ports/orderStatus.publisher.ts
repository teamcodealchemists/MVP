import { OrderId } from "../orderId.entity";

export interface OrderStatusPublisher {
    stockShipped(OrderId): Promise<void>;
    stockReceived(OrderId): Promise<void>;
}
