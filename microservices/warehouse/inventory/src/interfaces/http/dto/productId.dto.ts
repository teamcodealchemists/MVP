import { IsUUID } from 'class-validator';

export class productIdDto {
  @IsUUID()
  id: string; // ID del prodotto
}
