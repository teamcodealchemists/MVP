import { IsNumber } from 'class-validator';

export class warehouseIdDto {
  @IsNumber()
  warehouseId: number;
}
