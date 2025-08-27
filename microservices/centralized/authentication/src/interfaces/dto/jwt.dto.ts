import { IsJWT, IsNotEmpty} from "class-validator";

export class JwtDTO {
    @IsNotEmpty()
    @IsJWT()
    jwt: string;
}