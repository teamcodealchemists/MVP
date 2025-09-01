import { OrderIdDTO } from '../dto/orderId.dto';
import { InternalOrderDTO } from '../dto/internalOrder.dto';
import { SellOrderDTO } from '../dto/sellOrder.dto';

export interface GetOrderUseCase {

getOrder(OrderIdDTO): {OrderIdDTO, InternalOrderDTO} | {OrderIdDTO, SellOrderDTO};

}