import { WarehouseStateDTO } from 'src/interfaces/http/dto/warehouseStatedto';

export interface ReceiveWarehouseState {
  getWarehouseState(dto: WarehouseStateDTO[]): void;
}
