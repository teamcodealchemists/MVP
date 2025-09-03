import { IsNotEmpty, IsString, Min, ValidateNested, IsInt, IsDate, IsArray } from 'class-validator';

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
}