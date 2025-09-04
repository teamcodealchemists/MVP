import { IsUUID, IsNotEmpty, IsString, IsNumber, Min, ValidateNested } from 'class-validator';
import { productIdDto } from './productId.dto';
import { Type } from 'class-transformer';
import { warehouseIdDto } from './warehouseId.dto';

export class productDto {
  @IsString()
  id: productIdDto;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNumber()
  unitPrice: number;

  @IsNumber()
  quantity: number;

  @IsNumber()
  @Min(0)
  minThres: number;

  @IsNumber()
  @Min(0)
  maxThres: number;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() =>warehouseIdDto)
  warehouseId : warehouseIdDto;
}
