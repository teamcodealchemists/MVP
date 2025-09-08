import {IsArray, ValidateNested} from 'class-validator';
import { Type } from 'class-transformer';

import { OrderIdDTO } from "./orderId.dto";
import { SellOrderDTO } from "./sellOrder.dto";
import { InternalOrderDTO } from "./internalOrder.dto";

export class OrdersDTO {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SellOrderDTO)
    sellOrders: SellOrderDTO[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => InternalOrderDTO)
    internalOrders: InternalOrderDTO[];
}