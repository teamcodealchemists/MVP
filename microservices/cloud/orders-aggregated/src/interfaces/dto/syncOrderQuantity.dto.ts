import { IsNotEmpty, Min, IsInt, IsArray} from 'class-validator';

import { SyncOrderIdDTO } from './syncOrderId.dto';
import { SyncOrderItemDTO } from './syncOrderItem.dto';

export class SyncOrderQuantityDTO {
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    id: SyncOrderIdDTO;

    @IsNotEmpty()
    @IsArray()
    items: SyncOrderItemDTO[];
}
