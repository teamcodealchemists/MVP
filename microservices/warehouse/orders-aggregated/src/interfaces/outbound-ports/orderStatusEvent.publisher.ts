import { OrderId } from '../../domain/orderId.entity';

export interface OrderStatusEventPublisher {

orderCancelled(OrderId, number): Promise<void>;

orderCompleted(OrderId, number): Promise<void>;

}