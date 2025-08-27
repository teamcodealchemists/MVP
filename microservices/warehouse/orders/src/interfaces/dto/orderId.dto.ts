import { IsNotEmpty, Min, IsString } from 'class-validator';

export class OrderIdDTO {
    @IsNotEmpty()
    @IsString()
    id: string;
}