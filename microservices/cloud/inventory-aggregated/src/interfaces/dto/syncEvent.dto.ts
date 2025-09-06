import { IsString, IsNotEmpty, IsNumber, Min, IsUUID, IsOptional } from 'class-validator';

export class SyncEventDTO {
  @IsUUID()
  id!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  unitPrice!: number;

  @IsNumber()
  quantity!: number;

  @IsNumber()
  @Min(0)
  minThres!: number;

  @IsNumber()
  @Min(0)
  maxThres!: number;

  @IsString()
  eventType!: string;

  @IsString()
  timestamp!: string;

  @IsString()
  source!: string;

  @IsNumber()
  warehouseId!: number;
}