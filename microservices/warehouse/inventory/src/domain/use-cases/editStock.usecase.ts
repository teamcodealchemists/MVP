import { ProductDto } from 'src/interfaces/dto/product.dto';

export interface editStockUseCase {
  editStock(dto: ProductDto): Promise<void>;
}