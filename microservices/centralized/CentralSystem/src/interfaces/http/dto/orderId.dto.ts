import { IsNotEmpty,Matches , IsString } from 'class-validator';

export class OrderIdDTO {
    @IsNotEmpty()
    @IsString()
    id: string;
}