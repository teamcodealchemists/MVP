import { IsNotEmpty, Min, IsInt } from 'class-validator';

export class WarehouseIdDTO {
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    warehouseId: number;
}