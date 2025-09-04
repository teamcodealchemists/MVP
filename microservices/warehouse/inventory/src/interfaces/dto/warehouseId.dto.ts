import { IsNumber } from 'class-validator';

export class WarehouseIdDto {
  @IsNumber()
  warehouseId: number;
}
