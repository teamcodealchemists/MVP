import { IsNotEmpty, IsString, ValidateNested, IsInt, IsDate, IsArray } from 'class-validator';
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
        items: OrderItemDetailDTO[];

        @IsNotEmpty()
        @Type(() => OrderStateDTO)
        orderState: OrderStateDTO;

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