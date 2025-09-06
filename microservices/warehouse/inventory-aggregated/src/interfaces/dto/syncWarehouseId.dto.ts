import { IsNumber } from "class-validator";
export class SyncWarehouseIdDTO {
  @IsNumber()
  warehouseId: number;
}