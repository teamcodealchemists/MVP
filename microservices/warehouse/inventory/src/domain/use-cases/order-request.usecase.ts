import { productQuantityArrayDto } from 'src/interfaces/dto/productQuantityArray.dto';

export interface OrderRequestUseCase {
  orderRequest(dto: productQuantityArrayDto): Promise<boolean>;
  shipOrderRequest(dto : productQuantityArrayDto) : Promise<void>;
}
