import { IsUUID, IsNumber, Min } from 'class-validator';

export class aboveMaxThresDto {
  @IsUUID()
  id: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  maxThres: number;
}
