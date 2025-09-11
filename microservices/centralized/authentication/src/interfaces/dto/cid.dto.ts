import { IsAlphanumeric, IsNotEmpty} from "class-validator";

export class CidDTO {
    @IsNotEmpty()
    @IsAlphanumeric()
    cid: string;
}