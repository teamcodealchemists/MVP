import { Order } from '../../domain/order.entity';

export interface OrderUpdateEventPublisher {

orderUpdated(Order): Promise<void>;

}