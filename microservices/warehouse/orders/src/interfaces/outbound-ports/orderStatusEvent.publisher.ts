import { OrderItem } from 'src/domain/orderItem.entity';
import { OrderId } from '../../domain/orderId.entity';

export interface OrderStatusEventPublisher {

    orderCancelled(OrderId, number): Promise<void>;

    orderCompleted(orderID: OrderId, warehouse: number): Promise<void>;

}