import { IsNumber } from 'class-validator';

export class WarehouseIdDTO {
  @IsNumber()
  id!: number;
}
