import {IsArray, ValidateNested} from 'class-validator';

import { SyncOrderIdDTO } from "./syncOrderId.dto";
import { SyncSellOrderDTO } from "./syncSellOrder.dto";
import { SyncInternalOrderDTO } from "./syncInternalOrder.dto";

export class SyncOrdersDTO {
    
    @IsArray()
    sellOrders: SyncSellOrderDTO[];

    @IsArray()
    internalOrders: SyncInternalOrderDTO[];

}