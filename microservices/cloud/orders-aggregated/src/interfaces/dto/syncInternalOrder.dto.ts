import { IsNotEmpty, IsOptional, ValidateNested, IsInt, IsDate, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

import { SyncOrderIdDTO } from "./syncOrderId.dto";
import { SyncOrderItemDetailDTO } from "./syncOrderItemDetail.dto";
import { SyncOrderStateDTO } from "./syncOrderState.dto";

export class SyncInternalOrderDTO {
        @IsNotEmpty()
        @ValidateNested()
/*         @Type(() => SyncOrderIdDTO)
 */     orderId: SyncOrderIdDTO;

        @IsNotEmpty()
        @IsArray()
        items: SyncOrderItemDetailDTO[];

        @IsNotEmpty()
/*         @Type(() => SyncOrderStateDTO)
 */     orderState: SyncOrderStateDTO;

        @IsNotEmpty()
        @IsDate()
        creationDate: Date;

        @IsNotEmpty()
        @IsInt()
        warehouseDeparture: number;

        @IsNotEmpty()
        @IsInt()
        warehouseDestination: number;

        @IsOptional()
        @ValidateNested()
        @Type(() => SyncOrderIdDTO)
        sellOrderReference: SyncOrderIdDTO;
}