import { IsNotEmpty, Min, IsInt } from 'class-validator';

export class OrderIdDTO {
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    id: number;
}