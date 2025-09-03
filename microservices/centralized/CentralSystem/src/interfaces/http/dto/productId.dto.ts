import { IsString } from 'class-validator';

export class productIdDto {
  @IsString()
  id: string; // ID del prodotto
}
