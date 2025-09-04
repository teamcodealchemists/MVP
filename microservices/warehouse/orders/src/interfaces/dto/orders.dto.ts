import {IsArray, ValidateNested} from 'class-validator';

import { OrderIdDTO } from "./orderId.dto";
import { SellOrderDTO } from "./sellOrder.dto";
import { InternalOrderDTO } from "./internalOrder.dto";

export class OrdersDTO {
    @IsArray()
    @ValidateNested({ each: true })
    sellOrders: SellOrderDTO[];

    @IsArray()
    @ValidateNested({ each: true })
    internalOrders: InternalOrderDTO[];
}