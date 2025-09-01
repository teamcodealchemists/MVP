import { IsString, IsNotEmpty, IsNumber, Min, IsUUID, IsOptional, isNumber } from 'class-validator';

export class SyncProductDTO {
  @IsUUID()
  id!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  unitPrice!: number;

  @IsNumber()
  quantity!: number;

  @IsNumber()
  @Min(0)
  minThres!: number;

  @IsNumber()
  @Min(0)
  maxThres!: number;


  warehouseId!:string;

}
