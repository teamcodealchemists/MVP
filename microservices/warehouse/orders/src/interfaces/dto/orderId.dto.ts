import { IsString } from 'class-validator';

export class OrderIdDTO {
    @IsString()
    id: string;
}