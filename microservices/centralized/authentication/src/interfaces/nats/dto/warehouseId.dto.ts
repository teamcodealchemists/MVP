import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class WarehouseIdDTO {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  warehouseId: number;
}

