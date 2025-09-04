import { ProductQuantityArrayDto } from 'src/interfaces/dto/productQuantityArray.dto';

export interface OrderRequestUseCase {
  orderRequest(productQuantityArrayDto: ProductQuantityArrayDto): Promise<boolean>;
}
