import { ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { productDto } from './product.dto';

export class inventoryDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => productDto)
  productList: productDto[];
}
