import { OrderIdDTO } from '../dto/orderId.dto';

export interface OrderStatusEventListener {

cancelOrder(OrderIdDTO): void;

completeOrder(OrderIdDTO): void;

}