import {IsInstance} from 'class-validator';

import { OrderIdDTO } from "./orderId.dto";
import { SellOrderDTO } from "./sellOrder.dto";
import { InternalOrderDTO } from "./internalOrder.dto";

export class OrdersDTO {
    @IsInstance(Map)    
    sellOrders: Map<OrderIdDTO, SellOrderDTO>;

    @IsInstance(Map)    
    internalOrders: Map<OrderIdDTO, InternalOrderDTO>;
}