import { SellOrder } from '../../domain/sellOrder.entity';

export interface SellOrderEventPublisher {

publishSellOrder(SellOrder, reqReceiver: string): Promise<void>;

}