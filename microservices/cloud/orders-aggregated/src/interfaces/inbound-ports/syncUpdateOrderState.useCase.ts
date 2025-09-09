import { SyncOrderIdDTO } from '../dto/syncOrderId.dto';
import { SyncOrderStateDTO } from '../dto/syncOrderState.dto';

export interface SyncUpdateOrderStateUseCase {

updateOrderState(SyncOrderIdDTO, SyncOrderStateDTO): void;

}