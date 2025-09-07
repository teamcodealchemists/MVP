import { IsEnum, IsNotEmpty, IsPhoneNumber, IsString, ValidateNested } from "class-validator";
import { Type } from 'class-transformer';

import { AuthenticationDTO } from "./authentication.dto";

export class GlobalSupervisorDTO {

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
    @ValidateNested()
    @Type(() => AuthenticationDTO)
    authentication: AuthenticationDTO;
}