import { IsNotEmpty, Min, IsInt, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { ItemIdDTO } from './itemId.dto';

export class OrderItemDTO {
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => ItemIdDTO) 
    itemId: ItemIdDTO;

    @IsNotEmpty()
    @IsInt()
    @Min(0)
    quantity: number;

}
