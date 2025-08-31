import { IsNotEmpty, Min, IsInt, IsNumber } from 'class-validator';

import { OrderItemDTO } from './orderItem.dto';

export class OrderItemDetailDTO {
    @IsNotEmpty()
    item: OrderItemDTO;

    @IsNotEmpty()
    @IsInt()
    @Min(0)
    quantityReserved: number;

    @IsNotEmpty()
    @IsNumber({maxDecimalPlaces: 2},{message: 'Unit price must be a number with up to 2 decimal places'})
    @Min(0)
    unitPrice: number;
}
