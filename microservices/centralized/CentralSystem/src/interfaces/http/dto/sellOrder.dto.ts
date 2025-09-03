import { ValidateNested, IsNotEmpty, IsString, Min, IsInt, IsDate, IsArray } from 'class-validator';

import { OrderIdDTO } from "./orderId.dto";
import { OrderItemDTO } from "./orderItem.dto";
import { OrderStateDTO } from "./orderState.dto";
import { Type } from 'class-transformer';

export class SellOrderDTO {
        @IsNotEmpty()
        @ValidateNested()
        @Type(() => OrderIdDTO)
        orderId: OrderIdDTO;

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
        @IsString()
        destinationAddress: string;
}