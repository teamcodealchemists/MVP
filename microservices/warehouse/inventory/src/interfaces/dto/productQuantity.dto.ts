import { IsNumber, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductIdDto } from './productId.dto';

export class ProductQuantityDto {
  @ValidateNested()
  @Type(() => ProductIdDto)
  productId: ProductIdDto;

  @IsNumber()
  @Min(0)
  quantity: number;
}