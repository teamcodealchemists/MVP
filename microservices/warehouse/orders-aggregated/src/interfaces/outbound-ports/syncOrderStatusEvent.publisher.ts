import { SyncOrderId } from '../../domain/syncOrderId.entity';

export interface SyncOrderStatusEventPublisher {

orderCancelled(SyncOrderId, number): Promise<void>;

orderCompleted(SyncOrderId, number): Promise<void>;

}