import { ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { productDto } from './productDto';

export class InventoryDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => productDto)
  productList: productDto[];
}
