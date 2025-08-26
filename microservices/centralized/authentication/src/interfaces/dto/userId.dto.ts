import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator'

export class UserIdDTO {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  userId: number;
}