import { IsNotEmpty, Min, IsInt } from 'class-validator';

export class ItemIdDTO {
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    id: number;

}