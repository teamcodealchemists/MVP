import { IsString, ValidateNested } from 'class-validator';
import { WarehouseIdDTO } from './warehouse-id.dto';
import { Type } from 'class-transformer';

export class WarehouseStateDTO {
  @ValidateNested()                
  @Type(() => WarehouseIdDTO) 
  warehouseId: WarehouseIdDTO = {} as WarehouseIdDTO;

  @IsString()
  state!: string;
}
