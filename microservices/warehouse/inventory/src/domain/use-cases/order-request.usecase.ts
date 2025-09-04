import { ProductQuantityArrayDto } from 'src/interfaces/dto/productQuantityArray.dto';

export interface OrderRequestUseCase {
  orderRequest(dto: ProductQuantityArrayDto): Promise<void>;
  shipOrderRequest(dto : ProductQuantityArrayDto) : Promise<void>;
}
