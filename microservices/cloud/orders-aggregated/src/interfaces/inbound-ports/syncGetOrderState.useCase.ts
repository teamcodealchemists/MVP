import { SyncOrderIdDTO } from '../dto/syncOrderId.dto';
import { SyncOrderStateDTO } from '../dto/syncOrderState.dto';

export interface SyncGetOrderStateUseCase {

getOrderState(SyncOrderIdDTO): Promise<SyncOrderStateDTO>;

}