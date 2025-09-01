import { IsNotEmpty, Min, IsString } from 'class-validator';

export class OrderIdDTO {
    @IsString()
    id: string;
}