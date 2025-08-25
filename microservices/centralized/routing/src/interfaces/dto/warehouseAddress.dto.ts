import { IsNotEmpty, IsString } from 'class-validator';
import { WarehouseStateDTO } from './warehouseState.dto';

export class WarehouseAddressDTO {
    @IsNotEmpty()
    @IsString()
    warehouseState: WarehouseStateDTO;

    @IsNotEmpty()
    @IsString()
    address: string;
}