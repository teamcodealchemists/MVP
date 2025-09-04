import {IsArray} from 'class-validator';

import { SellOrderDTO } from "./sellOrder.dto";
import { InternalOrderDTO } from "./internalOrder.dto";

export class OrdersDTO {
    @IsArray()
    sellOrders: SellOrderDTO[];

    @IsArray()
    internalOrders: InternalOrderDTO[];

}