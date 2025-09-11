import { IsNotEmpty, ValidateNested, IsString, Min, IsInt, IsDate, IsArray } from 'class-validator';

import { SyncOrderIdDTO } from "./syncOrderId.dto";
import { SyncOrderItemDetailDTO } from "./syncOrderItemDetail.dto";
import { SyncOrderStateDTO } from "./syncOrderState.dto";

export class SyncSellOrderDTO {

        @IsNotEmpty()
        @ValidateNested()
        orderId: SyncOrderIdDTO;

        @IsNotEmpty()
        @IsArray()
        items: SyncOrderItemDetailDTO[];

        @IsNotEmpty()
        orderState: SyncOrderStateDTO;

        @IsNotEmpty()
        @IsDate()
        creationDate: Date;

        @IsNotEmpty()
        @IsInt()
        warehouseDeparture: number;

        @IsNotEmpty()
        @IsString()
        destinationAddress: string;
}