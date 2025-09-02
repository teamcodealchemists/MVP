import { IsString, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { warehouseIdDto } from 'src/interfaces/http/dto/warehouseId.dto';
export class WarehouseStateDTO {
  @ValidateNested()                  // perché è un oggetto DTO
  @Type(() => warehouseIdDto) 
  warehouseId: warehouseIdDto;
  @IsString()
  state : string;
}
