import { OrderQuantityDTO } from 'src/interfaces/http/dto/orderQuantity.dto';
import { warehouseIdDto } from 'src/interfaces/http/dto/warehouseId.dto';

export interface InsufficientQuantityEvent {
  handleInsufficientQuantity(dto: OrderQuantityDTO, dto1 : warehouseIdDto): void;
}
