import { IsString } from "class-validator";
export class SyncProductIdDTO {
  @IsString()
  id!: string;
}