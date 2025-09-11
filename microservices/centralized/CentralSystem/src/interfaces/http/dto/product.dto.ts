import { ValidateNested, IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';
import { warehouseIdDto } from './warehouseId.dto';
import { productIdDto } from './productId.dto';
import { Type } from 'class-transformer';

export class productDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() =>productIdDto)
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
