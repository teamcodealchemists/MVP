import { IsNotEmpty,Matches , IsString, IsUUID } from 'class-validator';

export class OrderIdDTO {
    @IsNotEmpty()
    @IsString()
    id: string;
}