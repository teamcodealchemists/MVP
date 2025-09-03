import { IsNotEmpty, IsString, ValidateNested, IsInt, IsDate, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderIdDTO } from "./orderId.dto";
import { OrderItemDTO } from "./orderItem.dto";
import { OrderStateDTO } from "./orderState.dto";

export class InternalOrderDTO {
        @IsNotEmpty()
        @ValidateNested()
        @Type(() => OrderIdDTO)
        orderId: OrderIdDTO;

        @IsNotEmpty()
        @IsArray()
        items: OrderItemDTO[];

        @IsNotEmpty()
        @IsString()
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