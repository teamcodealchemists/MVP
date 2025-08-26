import { IsEnum, IsNotEmpty, IsPhoneNumber, IsString } from "class-validator";
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
    @Type(() => AuthenticationDTO)
    authentication: AuthenticationDTO;

    @IsNotEmpty()
    @IsEnum({ "GLOBAL":0, "LOCAL":1 })
    role: number;
}