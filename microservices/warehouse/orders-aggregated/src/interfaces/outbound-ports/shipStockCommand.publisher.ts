import { OrderId } from '../../domain/orderId.entity';
import { OrderItem } from '../../domain/orderItem.entity';

export interface ShipStockCommandPublisher {

publishShipment(OrderId, items: OrderItem[]): Promise<void>;

receiveShipment(OrderId, items: OrderItem[], number): Promise<void>;

}