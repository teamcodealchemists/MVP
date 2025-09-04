import { IsString, IsUUID } from 'class-validator';

export class productIdDto {
  @IsString()
  id: string; // ID del prodotto
}
