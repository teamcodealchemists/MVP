import { IsNotEmpty, Min, IsInt, IsString } from 'class-validator';
import { WarehouseIdDTO } from './warehouseId.dto';
import { Type } from 'class-transformer';

export class WarehouseStateDTO {
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    @Type(() => WarehouseIdDTO)
    warehouseId: WarehouseIdDTO;

    @IsNotEmpty()
    @IsString()
    state: string;
}