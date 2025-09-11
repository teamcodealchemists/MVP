import { IsNotEmpty, Min, IsInt, IsString, IsDate, IsISO8601 } from 'class-validator';
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
    heartbeatMsg: string;

    @IsNotEmpty()
    @IsISO8601()
    timestamp: Date;
}