import { IsNotEmpty, Min, IsInt, IsString } from 'class-validator';
import { WarehouseIdDTO } from './warehouseId.dto';

export class WarehouseStateDTO {
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    id: WarehouseIdDTO;

    @IsNotEmpty()
    @IsString()
    state: string;
}