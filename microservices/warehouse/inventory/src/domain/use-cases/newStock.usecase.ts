import { ProductDto } from 'src/interfaces/dto/product.dto';

export interface newStockUseCase {
  newStock(dto: ProductDto): Promise<void>;
}
