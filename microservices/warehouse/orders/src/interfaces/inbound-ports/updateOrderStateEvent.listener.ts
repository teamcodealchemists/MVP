import { OrderIdDTO } from '../dto/orderId.dto';
import { OrderStateDTO } from '../dto/orderState.dto';

export interface UpdateOrderStateEventListener {

updateOrderState(OrderIdDTO, OrderStateDTO): void;

}