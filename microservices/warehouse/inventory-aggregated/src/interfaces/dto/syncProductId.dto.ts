import { IsUUID } from "class-validator";
export class SyncProductIdDTO {
  @IsUUID()
  id!: string;
}