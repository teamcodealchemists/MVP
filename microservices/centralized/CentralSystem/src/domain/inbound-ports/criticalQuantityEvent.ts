import { productDto } from 'src/interfaces/http/dto/product.dto';
import { warehouseIdDto } from 'src/interfaces/http/dto/warehouseId.dto';

export interface CriticalQuantityEvent {
  handleCriticalQuantityMin(productDTO:productDto, warehouseIdDTO : warehouseIdDto): void;
  handleCriticalQuantityMax(productDTO:productDto, warehouseIdDTO : warehouseIdDto): void;
}