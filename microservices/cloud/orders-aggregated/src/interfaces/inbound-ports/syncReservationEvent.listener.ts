import { SyncOrderQuantityDTO } from '../dto/syncOrderQuantity.dto';
import { SyncOrderIdDTO } from '../dto/syncOrderId.dto';

export interface SyncReservationEventListener {

stockReserved(SyncOrderQuantityDTO): Promise<void>;

unreserveStock(orderIdDTO: SyncOrderIdDTO): Promise<void>; 

}