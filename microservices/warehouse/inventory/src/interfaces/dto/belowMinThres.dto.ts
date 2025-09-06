import { IsNumber, Min } from 'class-validator';
import { ProductIdDto } from './productId.dto';
import { Type } from 'class-transformer';

export class BelowMinThresDto {
  @Type(() => ProductIdDto)
  id: ProductIdDto;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  minThres: number;
}
