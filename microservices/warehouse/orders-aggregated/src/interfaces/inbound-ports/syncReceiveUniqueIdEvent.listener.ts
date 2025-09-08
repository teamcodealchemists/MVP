import { SyncOrderIdDTO } from '../dto/syncOrderId.dto';

export interface SyncReceiveUniqueIdEventListener {

 receiveUniqueId(SyncOrderIdDTO): void

}