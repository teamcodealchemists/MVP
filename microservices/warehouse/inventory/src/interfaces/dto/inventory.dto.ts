import { ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductDto } from './product.dto';

export class InventoryDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductDto)
  productList: ProductDto[];
}
