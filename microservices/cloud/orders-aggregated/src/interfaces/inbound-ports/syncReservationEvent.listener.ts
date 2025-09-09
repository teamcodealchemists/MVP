import { SyncOrderQuantityDTO } from '../dto/syncOrderQuantity.dto';

export interface SyncReservationEventListener {

stockReserved(SyncOrderQuantityDTO): void;

}