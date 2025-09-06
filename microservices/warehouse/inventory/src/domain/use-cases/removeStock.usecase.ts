import { ProductDto } from 'src/interfaces/dto/product.dto';

export interface removeStockUseCase {
 removeStock(dto: ProductDto): Promise<void>;
}