import { IsNotEmpty, IsString, ValidateNested, IsInt, IsDate, Matches, IsOptional, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

import { OrderIdDTO } from "./orderId.dto";
import { OrderItemDetailDTO } from "./orderItemDetail.dto";
import { OrderStateDTO } from "./orderState.dto";

export class InternalOrderDTO {
        @ValidateNested()
        @Type(() => OrderIdDTO)
        orderId: OrderIdDTO;
        
        @IsNotEmpty()
        @IsArray()
        @ValidateNested({ each: true })
        @Type(() => OrderItemDetailDTO)
        items: OrderItemDetailDTO[];

        @IsNotEmpty()
        @ValidateNested()
        @Type(() => OrderStateDTO)
        orderState: OrderStateDTO;

        @IsNotEmpty()
        @IsDate()
        @Type(() => Date)
        creationDate: Date;

        @IsNotEmpty()
        @IsInt()
        warehouseDeparture: number;

        @IsNotEmpty()
        @IsInt()
        warehouseDestination: number;

        @IsOptional()
        @ValidateNested()
        @Type(() => OrderIdDTO)
        sellOrderReference: OrderIdDTO;
}