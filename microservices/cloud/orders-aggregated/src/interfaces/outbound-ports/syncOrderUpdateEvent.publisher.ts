import { SyncOrder } from '../../domain/syncOrder.entity';

export interface SyncOrderUpdateEventPublisher {

orderUpdated(SyncOrder): Promise<void>;

}