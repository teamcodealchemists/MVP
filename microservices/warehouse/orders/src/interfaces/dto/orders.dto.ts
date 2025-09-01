import {IsArray, ValidateNested} from 'class-validator';

import { OrderIdDTO } from "./orderId.dto";
import { SellOrderDTO } from "./sellOrder.dto";
import { InternalOrderDTO } from "./internalOrder.dto";

export class OrdersDTO {
    @IsArray()
    @ValidateNested({ each: true })
    sellOrders: Array<{ orderId: OrderIdDTO; order: SellOrderDTO }>;

    @IsArray()
    @ValidateNested({ each: true })
    internalOrders: Array<{ orderId: OrderIdDTO; order: InternalOrderDTO }>;
}