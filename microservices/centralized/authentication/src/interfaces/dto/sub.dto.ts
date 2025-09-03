import { IsAlphanumeric, IsNotEmpty} from "class-validator";

export class SubDTO {
    @IsNotEmpty()
    @IsAlphanumeric()
    sub: string;
}