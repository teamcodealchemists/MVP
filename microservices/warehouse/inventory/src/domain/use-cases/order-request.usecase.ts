import { ProductQuantityArrayDto } from 'src/interfaces/dto/productQuantityArray.dto';

export interface OrderRequestUseCase {
  orderRequest(dto: ProductQuantityArrayDto): Promise<boolean>;
  shipOrderRequest(dto : ProductQuantityArrayDto) : Promise<void>;
  receiveShipment(dto : ProductQuantityArrayDto) : Promise<void>;
  unreserveStock(dto : ProductQuantityArrayDto) : Promise<void>;
}
