import { OrderIdDTO } from '../dto/orderId.dto';

export interface ReceiveUniqueIdEventListener {

 receiveUniqueId(OrderIdDTO): void

}