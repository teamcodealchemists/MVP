import { IsNotEmpty, IsString, Min, IsInt, IsDate, IsArray } from 'class-validator';

import { SyncOrderIdDTO } from "./syncOrderId.dto";
import { SyncOrderItemDetailDTO } from "./syncOrderItemDetail.dto";
import { SyncOrderStateDTO } from "./syncOrderState.dto";

export class SyncInternalOrderDTO {
        @IsNotEmpty()
        @IsArray()
        items: SyncOrderItemDetailDTO[];

        @IsNotEmpty()
        @IsString()
        orderState: SyncOrderStateDTO;

        @IsNotEmpty()
        @IsDate()
        creationDate: Date;

        @IsNotEmpty()
        @IsInt()
        warehouseDeparture: number;

        @IsNotEmpty()
        @IsInt()
        warehouseDestination: number;
}