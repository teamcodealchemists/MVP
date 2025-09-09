import { IsString } from 'class-validator';

export class SyncOrderIdDTO {
    @IsString()
    id: string;
}