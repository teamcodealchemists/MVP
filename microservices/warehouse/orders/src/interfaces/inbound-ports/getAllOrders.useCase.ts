import { Orders } from 'src/domain/orders.entity';
import { OrdersDTO } from '../dto/orders.dto';

export interface GetAllOrdersUseCase {

getAllOrders(): Promise<string> ;

}