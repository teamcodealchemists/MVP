import { OrderId } from '../../domain/orderId.entity';
import { OrderItem } from '../../domain/orderItem.entity';

export interface ReserveStockCommandPublisher {

publishReserveStock(OrderId, items: OrderItem[]): Promise<void>;

}