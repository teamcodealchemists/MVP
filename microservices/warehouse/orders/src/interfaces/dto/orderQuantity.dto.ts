import { IsNotEmpty, ArrayNotEmpty, ValidateNested, IsArray} from 'class-validator';
import { Type } from 'class-transformer';

import { OrderIdDTO } from './orderId.dto';
import { OrderItemDTO } from './orderItem.dto';

export class OrderQuantityDTO {
    @ValidateNested()
    @Type(() => OrderIdDTO)
    @IsNotEmpty()
    id: OrderIdDTO;

    
    @ArrayNotEmpty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDTO)
    items: OrderItemDTO[];
}
