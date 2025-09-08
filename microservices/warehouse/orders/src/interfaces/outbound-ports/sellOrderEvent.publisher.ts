import { SellOrder } from '../../domain/sellOrder.entity';

export interface SellOrderEventPublisher {

publishSellOrder(SellOrder, context: { destination: string, warehouseId?: number }): Promise<void>;

}