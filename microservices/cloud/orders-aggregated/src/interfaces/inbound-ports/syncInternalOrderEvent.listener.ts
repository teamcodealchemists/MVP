import { SyncInternalOrderDTO } from '../dto/syncInternalOrder.dto';

export interface SyncInternalOrderEventListener {

syncAddInternalOrder(SyncInternalOrderDTO): void;

}