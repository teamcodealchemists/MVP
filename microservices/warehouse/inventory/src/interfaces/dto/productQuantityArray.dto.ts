import { ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductQuantityDto } from './productQuantity.dto';

export class ProductQuantityArrayDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductQuantityDto)
  productQuantityArray: ProductQuantityDto[];
}
