import { OrderId } from '../../domain/orderId.entity';

export interface UniqueIdRequestPublisher {

    requestUniqueId(OrderId): void

}