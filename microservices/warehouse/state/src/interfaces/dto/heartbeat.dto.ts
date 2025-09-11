import { IsString, IsDate, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class HeartbeatDTO {
  @IsString()
  heartbeatMsg!: string;

  @IsDate()
  @Type(() => Date)
  timestamp!: Date;

  @IsNumber()
  warehouseId!: number;
}
