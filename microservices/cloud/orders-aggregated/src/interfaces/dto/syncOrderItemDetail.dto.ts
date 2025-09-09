import { IsNotEmpty, Min, IsInt, IsNumber } from 'class-validator';

import { SyncOrderItemDTO } from './syncOrderItem.dto';

export class SyncOrderItemDetailDTO {
    @IsNotEmpty()
    item: SyncOrderItemDTO;

    @IsNotEmpty()
    @IsInt()
    @Min(0)
    quantityReserved: number;

    @IsNotEmpty()
    @IsNumber({maxDecimalPlaces: 2},{message: 'Unit price must be a number with up to 2 decimal places'})
    @Min(0)
    unitPrice: number;
}
