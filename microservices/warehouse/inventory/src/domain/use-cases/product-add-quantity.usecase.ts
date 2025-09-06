import { ProductQuantityDto } from 'src/interfaces/dto/productQuantity.dto';

export interface ProductAddQuantityUseCase {
  addQuantity(dto: ProductQuantityDto): Promise<void> ;
}