import { ValidateNested, IsNotEmpty, Min, IsInt, IsArray} from 'class-validator';

import { OrderIdDTO } from './orderId.dto';
import { OrderItemDTO } from './orderItem.dto';
import { Type } from 'class-transformer';

export class OrderQuantityDTO {
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => OrderIdDTO)
    id: OrderIdDTO;

    @IsNotEmpty()
    @IsArray()
    items: OrderItemDTO[];
}
