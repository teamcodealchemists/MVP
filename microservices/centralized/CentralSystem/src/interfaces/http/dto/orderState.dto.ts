import { IsNotEmpty, IsString } from 'class-validator';
    
export class OrderStateDTO {
    @IsNotEmpty()
    @IsString()
    orderState: string;
}