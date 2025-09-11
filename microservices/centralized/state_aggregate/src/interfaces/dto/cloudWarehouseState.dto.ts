import { IsNotEmpty, Min, IsInt, IsString } from 'class-validator';
import { CloudWarehouseIdDTO } from './cloudWarehouseId.dto';
import { Type } from 'class-transformer';

export class CloudWarehouseStateDTO {
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    @Type(() => CloudWarehouseIdDTO)
    warehouseId: number;

    @IsNotEmpty()
    @IsString()
    state: string;
}