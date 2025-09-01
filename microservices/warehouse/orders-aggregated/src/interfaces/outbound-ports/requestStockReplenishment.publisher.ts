import { OrderId } from '../../domain/orderId.entity';
import { OrderItem } from '../../domain/orderItem.entity';

export interface RequestStockReplenishmentPublisher {

publishStockRepl(OrderId, items: OrderItem[]): Promise<void>;

}