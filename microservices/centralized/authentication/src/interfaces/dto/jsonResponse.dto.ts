import { IsJSON, IsNotEmpty } from "class-validator";

export class JsonResponseDTO {
    @IsNotEmpty()
    @IsJSON()
    response : {
        result?: any;
        resource?: any;
        error?: {
            code: string;
            message: string;
        };
        meta?: any;
    }
}