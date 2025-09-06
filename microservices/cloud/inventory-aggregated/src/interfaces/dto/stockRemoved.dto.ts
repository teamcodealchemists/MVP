import { IsString, IsNotEmpty, IsNumber, Min, IsUUID, IsOptional } from 'class-validator';

export class StockRemovedDTO {
  @IsUUID()
  id!: string;

  @IsString()
  @IsNotEmpty()
  warehouseId!: string;

  @IsNumber()
  quantity!: number;
} 