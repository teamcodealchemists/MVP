import { IsString, IsNotEmpty, IsNumber, Min, IsUUID, IsOptional, isNumber } from 'class-validator';
import { SyncWarehouseIdDTO } from './syncWarehouseId.dto';
import { Type } from 'class-transformer';
import { SyncProductIdDTO } from './syncProductId.dto';

export class SyncProductDTO {
  @Type(() => SyncProductIdDTO)
  @IsNotEmpty()
  id: SyncProductIdDTO;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  unitPrice: number;

  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  quantityReserved: number;

  @IsNumber()
  @Min(0)
  minThres: number;

  @IsNumber()
  @Min(0)
  maxThres: number;

  @IsNotEmpty()
  @Type(() => SyncWarehouseIdDTO)
  warehouseId: SyncWarehouseIdDTO;

}
