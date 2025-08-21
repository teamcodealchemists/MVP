import { IsNotEmpty, IsString, Min, IsInt, IsDate, IsArray } from 'class-validator';

import { OrderIdDTO } from "./orderId.dto";
import { OrderItemDetailDTO } from "./orderItemDetail.dto";
import { OrderStateDTO } from "./orderState.dto";

export class SellOrderDTO {
        @IsNotEmpty()
        @IsString()
        @Min(0)
        orderId: OrderIdDTO;

        @IsNotEmpty()
        @IsArray()
        items: OrderItemDetailDTO[];

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