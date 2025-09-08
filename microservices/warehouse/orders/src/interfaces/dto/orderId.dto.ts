import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class OrderIdDTO {
    @IsNotEmpty()
    @Matches(/^[IS][a-fA-F0-9-]+$/)
    id: string;
}