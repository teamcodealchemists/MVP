import { IsNotEmpty, IsString, IsNumber, Min, ValidateNested, IsPositive } from 'class-validator';
import { ProductIdDto } from './productId.dto';
import { Type } from 'class-transformer';
import { WarehouseIdDto } from './warehouseId.dto';

export class ProductDto {

  @IsNotEmpty()
  @Type(() => ProductIdDto)
  id: ProductIdDto;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  unitPrice: number;

  @IsNotEmpty()
  @Min(0)
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  quantityReserved : number;

  @IsNumber()
  @Min(0)
  minThres: number;

  @IsNumber()
  @Min(0)
  maxThres: number;

  @IsNotEmpty()
  @Type(() => WarehouseIdDto)
  warehouseId : WarehouseIdDto;
}
