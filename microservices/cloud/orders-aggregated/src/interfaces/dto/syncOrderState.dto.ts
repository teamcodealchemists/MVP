import { IsNotEmpty, IsString } from 'class-validator';
    
export class SyncOrderStateDTO {
    @IsNotEmpty()
    @IsString()
    orderState: string;
}