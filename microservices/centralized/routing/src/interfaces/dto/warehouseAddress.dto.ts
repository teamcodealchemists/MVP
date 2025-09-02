import { IsNotEmpty, IsString } from 'class-validator';
import { WarehouseStateDTO } from './warehouseState.dto';
import { Type } from 'class-transformer';

export class WarehouseAddressDTO {
    @IsNotEmpty()
    @Type(() => WarehouseStateDTO)
    warehouseState: WarehouseStateDTO;

    @IsNotEmpty()
    @IsString()
    address: string;
}