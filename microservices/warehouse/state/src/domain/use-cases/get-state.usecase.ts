import { WarehouseIdDTO } from '../../interfaces/dto/warehouse-id.dto';
import { WarehouseStateDTO } from '../../interfaces/dto/warehouse-state.dto';
import { StateRepository } from '../mongodb/state.repository';
import { DataMapper } from '../../infrastructure/mappers/datamapper';

export class GetStateUseCase {
  constructor(private readonly stateRepository: StateRepository) {}

  public async getSyncedState(dto: WarehouseIdDTO): Promise<WarehouseStateDTO | null> {
    
    const warehouseId = DataMapper.toDomainWarehouseId(dto);

  
    const state = await this.stateRepository.getState(warehouseId);
    if (!state) return null;

 
    return DataMapper.toDTOWarehouseState(state);
  }
}
