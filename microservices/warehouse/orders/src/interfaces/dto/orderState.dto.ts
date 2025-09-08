import { IsNotEmpty, IsEnum, IsString } from 'class-validator';
import { OrderState } from '../../domain/orderState.enum';

export class OrderStateDTO {
    @IsNotEmpty()
    @IsEnum(OrderState)
    @IsString()
    orderState: string;
}