import { InternalOrder } from '../../domain/internalOrder.entity';

export interface InternalOrderEventPublisher {

publishInternalOrder(InternalOrder, reqReceiver: string): Promise<void>;

}