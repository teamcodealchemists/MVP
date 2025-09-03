import { IsNotEmpty, Min, IsInt, IsNumber } from 'class-validator';

import { SyncItemIdDTO } from './syncItemId.dto';

export class SyncOrderItemDTO {
    @IsNotEmpty()
    itemId: SyncItemIdDTO;

    @IsNotEmpty()
    @IsInt()
    @Min(0)
    quantity: number;

}
