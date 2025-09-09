import { SellOrder } from '../../domain/sellOrder.entity';

export interface SellOrderEventPublisher {

publishSellOrder(sellorder : SellOrder, context: { destination: string, warehouseId?: number }): Promise<string>;

}