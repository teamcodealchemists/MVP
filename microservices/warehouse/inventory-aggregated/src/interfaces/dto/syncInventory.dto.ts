import { IsOptional } from "class-validator";
import { SyncProductDTO } from "./syncProduct.dto";
export class SyncInventoryDTO {
  @IsOptional()
  productList!: SyncProductDTO[];
}