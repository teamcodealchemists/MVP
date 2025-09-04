import { ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { productQuantityDto } from './productQuantity.dto';

export class productQuantityArrayDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => productQuantityDto)
  productQuantityArray: productQuantityDto[];
}
