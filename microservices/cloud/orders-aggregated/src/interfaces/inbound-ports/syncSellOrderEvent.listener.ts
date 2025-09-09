import { SyncSellOrderDTO } from '../dto/syncSellOrder.dto';

export interface SyncSellOrderEventListener {

syncAddSellOrder(SyncSellOrderDTO): void;

}