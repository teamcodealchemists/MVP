import { SyncOrders } from '../../domain/syncOrders.entity';

export interface AllProductsPublisher {

 publishAllProducts(SyncOrders): void

}