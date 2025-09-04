import { WarehouseStateDTO } from 'src/interfaces/http/dto/warehouseState.dto';

export interface ReceiveWarehouseState {
  getWarehouseState(dto: WarehouseStateDTO[]): void;
}
