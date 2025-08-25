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
    @IsEnum({ "GLOBAL":0, "LOCAL":1 })
    role: number;

    @IsNotEmpty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => WarehouseIdDTO)
    warehouseAssigned: WarehouseIdDTO[];
}