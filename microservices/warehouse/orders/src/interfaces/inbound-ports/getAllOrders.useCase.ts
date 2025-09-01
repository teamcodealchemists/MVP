import { OrdersDTO } from '../dto/orders.dto';

export interface GetAllOrdersUseCase {

getAllOrders(): OrdersDTO;

}