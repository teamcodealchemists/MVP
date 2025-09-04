import { ProductDto } from 'src/interfaces/dto/product.dto';

export interface EditStockUseCase {
  editStock(dto: ProductDto): Promise<string>;
}