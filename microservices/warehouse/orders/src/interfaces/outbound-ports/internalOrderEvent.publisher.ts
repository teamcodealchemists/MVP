import { InternalOrder } from '../../domain/internalOrder.entity';

export interface InternalOrderEventPublisher {

publishInternalOrder(InternalOrder): Promise<void>;

publishInternalOrderCopy(InternalOrder, number): Promise<void>;

}