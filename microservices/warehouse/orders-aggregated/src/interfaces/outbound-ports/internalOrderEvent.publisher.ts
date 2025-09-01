import { InternalOrder } from '../../domain/internalOrder.entity';

export interface InternalOrderEventPublisher {

publishInternalOrder(InternalOrder, context: { destination: string, warehouseId?: number }): Promise<void>;

}