import {IsArray, ValidateNested} from 'class-validator';

import { SyncOrderIdDTO } from "./syncOrderId.dto";
import { SyncSellOrderDTO } from "./syncSellOrder.dto";
import { SyncInternalOrderDTO } from "./syncInternalOrder.dto";

export class SyncOrdersDTO {
    @IsArray()
    @ValidateNested({ each: true })
    sellOrders: Array<{ orderId: SyncOrderIdDTO; order: SyncSellOrderDTO }>;

    @IsArray()
    @ValidateNested({ each: true })
    internalOrders: Array<{ orderId: SyncOrderIdDTO; order: SyncInternalOrderDTO }>;
}