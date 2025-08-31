import { IsString, IsNumber } from 'class-validator';
import { warehouseIdDto } from 'src/interfaces/http/dto/warehouseId.dto';
export class WarehouseStateDTO {
  @IsString()
  state : string;
  @IsNumber()
  warehouseId: warehouseIdDto;
}
