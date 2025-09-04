import { IsNotEmpty, Min, IsInt, IsString, IsDate } from 'class-validator';
import { CloudWarehouseIdDTO } from './cloudWarehouseId.dto';
import { Type } from 'class-transformer';

export class CloudHeartbeatDTO {
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    @Type(() => CloudWarehouseIdDTO)
    warehouseId: number;

    @IsNotEmpty()
    @IsString()
    heartbeatmsg: string;

    @IsNotEmpty()
    @IsDate()
    timestamp: Date;
}