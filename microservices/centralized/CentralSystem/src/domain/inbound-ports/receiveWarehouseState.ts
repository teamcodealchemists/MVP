import { WarehouseStateDTO } from 'src/interfaces/http/dto/WarehouseState.dto';

export interface ReceiveWarehouseState {
  getWarehouseState(dto: WarehouseStateDTO[]): void;
}
