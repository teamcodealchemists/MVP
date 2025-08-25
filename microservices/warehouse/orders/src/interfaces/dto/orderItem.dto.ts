import { IsNotEmpty, Min, IsInt, IsNumber } from 'class-validator';

import { ItemIdDTO } from './itemId.dto';

export class OrderItemDTO {
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    itemId: ItemIdDTO;

    @IsNotEmpty()
    @IsInt()
    @Min(0)
    quantity: number;

}
