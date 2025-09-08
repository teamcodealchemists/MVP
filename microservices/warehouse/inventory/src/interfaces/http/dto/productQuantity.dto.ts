import { IsNumber, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { productIdDto } from './productId.dto';

export class productQuantityDto {
  @ValidateNested()
  @Type(() => productIdDto)
  productId: productIdDto;

  @IsNumber()
  @Min(0)
  quantity: number;
}