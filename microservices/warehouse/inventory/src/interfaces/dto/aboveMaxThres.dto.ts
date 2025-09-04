import { IsNumber, Min } from 'class-validator';
import { ProductIdDto } from './productId.dto';
import { Type } from 'class-transformer';

export class AboveMaxThresDto {
  @Type(() => ProductIdDto)
  id: ProductIdDto;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  maxThres: number;
}
