import { IsNotEmpty, Min, IsInt } from 'class-validator';

export class CloudWarehouseIdDTO {
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    warehouseId: number;
}