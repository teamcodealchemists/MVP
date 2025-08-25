import { IsNotEmpty, Min, IsInt, IsArray} from 'class-validator';

import { OrderIdDTO } from './orderId.dto';
import { OrderItemDTO } from './orderItem.dto';

export class OrderQuantityDTO {
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    id: OrderIdDTO;

    @IsNotEmpty()
    @IsArray()
    items: OrderItemDTO[];
}
