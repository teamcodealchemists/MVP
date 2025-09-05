import { OrderQuantityDTO } from '../dto/orderQuantity.dto';
import { OrderIdDTO } from '../dto/orderId.dto';

export interface ReservationEventListener {

stockReserved(OrderQuantityDTO): void;
sufficientProductAvailability(orderIdDTO: OrderIdDTO): Promise<void>;
}