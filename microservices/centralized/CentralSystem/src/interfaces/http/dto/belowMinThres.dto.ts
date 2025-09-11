import { IsUUID, IsNumber, Min } from 'class-validator';

export class belowMinThresDto {
  @IsUUID()
  id: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  minThres: number;
}
