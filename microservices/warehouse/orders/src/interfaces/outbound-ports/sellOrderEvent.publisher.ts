import { SellOrder } from '../../domain/sellOrder.entity';

export interface SellOrderEventPublisher {

publishSellOrder(SellOrder): Promise<void>;

publishSellOrderCopy(SellOrder, number): Promise<void>;

}