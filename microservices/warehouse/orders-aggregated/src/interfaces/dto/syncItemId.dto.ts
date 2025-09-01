import { IsNotEmpty, Min, IsInt } from 'class-validator';

export class SyncItemIdDTO {
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    id: number;

}