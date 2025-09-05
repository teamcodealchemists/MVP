// src/domain/inbound-ports/get-state.usecase.ts
import { WarehouseIdDTO } from '../../interfaces/dto/warehouse-id.dto';
import { WarehouseStateDTO } from '../../interfaces/dto/warehouse-state.dto';

export interface GetStateUseCase {
  getSyncedState(dto: WarehouseIdDTO): Promise<WarehouseStateDTO | null>;
}
