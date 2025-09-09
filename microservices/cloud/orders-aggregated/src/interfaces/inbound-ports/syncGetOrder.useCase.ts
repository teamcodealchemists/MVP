import { SyncOrderIdDTO } from '../dto/syncOrderId.dto';
import { SyncInternalOrderDTO } from '../dto/syncInternalOrder.dto';
import { SyncSellOrderDTO } from '../dto/syncSellOrder.dto';

export interface SyncGetOrderUseCase {

getOrder(SyncOrderIdDTO): Promise<SyncInternalOrderDTO | SyncSellOrderDTO>;

}