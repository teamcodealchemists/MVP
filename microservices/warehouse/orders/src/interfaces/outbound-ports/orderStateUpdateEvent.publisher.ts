import { OrderItem } from 'src/domain/orderItem.entity';
import { OrderId } from '../../domain/orderId.entity';
import { OrderState } from '../../domain/orderState.enum';

export interface OrderStateUpdateEventPublisher {

orderStateUpdated(orderId: OrderId, orderState: OrderState, context: { destination: string, warehouseId?: number }): Promise<string>;
    

}