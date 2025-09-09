import { SyncOrderIdDTO } from '../dto/syncOrderId.dto';

export interface SyncOrderStatusEventListener {

cancelOrder(SyncOrderIdDTO): void;

completeOrder(SyncOrderIdDTO): void;

}