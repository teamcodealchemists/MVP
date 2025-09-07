import { OrderQuantityDTO } from '../dto/orderQuantity.dto';
import { OrderIdDTO } from '../dto/orderId.dto';

export interface ReservationEventListener {

stockReserved(OrderQuantityDTO): Promise<void>;
sufficientProductAvailability(orderIdDTO: OrderIdDTO): Promise<void>;
}