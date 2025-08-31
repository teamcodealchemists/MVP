import { IsUUID, IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';

export class productDto {
  @IsUUID()
  id: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNumber()
  unitPrice: number;

  @IsNumber()
  quantity: number;

  @IsNumber()
  @Min(0)
  minThres: number;

  @IsNumber()
  @Min(0)
  maxThres: number;
}
