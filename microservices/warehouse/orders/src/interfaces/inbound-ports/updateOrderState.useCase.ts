import { OrderIdDTO } from '../dto/orderId.dto';
import { OrderStateDTO } from '../dto/orderState.dto';

export interface UpdateOrderStateUseCase {

updateOrderState(OrderIdDTO, OrderStateDTO): void;

}