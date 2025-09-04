import { ProductDto } from 'src/interfaces/dto/product.dto';
import { ProductIdDto } from 'src/interfaces/dto/productId.dto';

export interface getProductUseCase {
  getProduct(dto : ProductIdDto) : Promise<ProductDto>;
}