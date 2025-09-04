import { IsString } from 'class-validator';

export class WarehouseStateDTO {
  @IsString()
  state!: string;
}
