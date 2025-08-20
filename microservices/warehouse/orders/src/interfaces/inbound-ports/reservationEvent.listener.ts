import { OrderQuantityDTO } from '../dto/orderQuantity.dto';

export interface ReservationEventListener {

stockReserved(OrderQuantityDTO): void;

}