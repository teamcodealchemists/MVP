import { ValidateNested, IsArray, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductQuantityDto } from './productQuantity.dto';
import { OrderIdDTO } from './orderId.dto';

export class ProductQuantityArrayDto {
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => OrderIdDTO)
    id: OrderIdDTO;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductQuantityDto)
  productQuantityArray: ProductQuantityDto[];
}
