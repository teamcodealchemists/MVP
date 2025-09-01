import { OrderIdDTO } from '../dto/orderId.dto';

export interface ShipmentEventListener {

waitingForStock(OrderIdDTO): void;

stockShipped(OrderIdDTO): void;

stockReceived(OrderIdDTO): void;

replenishmentReceived(OrderIdDTO): void;

}