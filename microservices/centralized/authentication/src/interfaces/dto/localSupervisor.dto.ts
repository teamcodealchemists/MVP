import { IsEnum, IsNotEmpty, IsPhoneNumber, IsString, IsArray, ValidateNested} from "class-validator";
import { Type } from 'class-transformer';

import { WarehouseIdDTO } from "./warehouseId.dto";
import { AuthenticationDTO } from "./authentication.dto";

export class LocalSupervisorDTO {

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    surname: string;

    @IsNotEmpty()
    @IsString()
    @IsPhoneNumber()
    phone: string;

    @IsNotEmpty()
    @Type(() => AuthenticationDTO)
    authentication: AuthenticationDTO;

    @IsNotEmpty()
    @IsArray()
    @ValidateNested()
    @Type(() => WarehouseIdDTO)
    warehouseAssigned: WarehouseIdDTO[];
}