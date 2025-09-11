import { WarehouseIdDTO } from '../../interfaces/dto/warehouse-id.dto';
import { WarehouseStateDTO } from '../../interfaces/dto/warehouse-state.dto';
import { HeartbeatDTO } from '../../interfaces/dto/heartbeat.dto';
import { WarehouseId } from '../../domain/warehouse-id.entity';
import { WarehouseState } from '../../domain/warehouse-state.entity';
import { Heartbeat } from '../../domain/heartbeat.entity';

export const DataMapper = {
 
  toDomainWarehouseId(dto: WarehouseIdDTO): WarehouseId {
    return new WarehouseId(dto.id);
  },

  toDomainWarehouseState(dto: WarehouseStateDTO): WarehouseState {
    return new WarehouseState(dto.state);
  },

  toDomainHeartbeat(dto: HeartbeatDTO): Heartbeat {
    const warehouseId = new WarehouseId(dto.warehouseId);
    return new Heartbeat(warehouseId, dto.heartbeatMsg, dto.timestamp);
  },

  
  toDTOWarehouseId(entity: WarehouseId): WarehouseIdDTO {
    return { id: entity.getId() };
  },

  toDTOWarehouseState(entity: WarehouseState , wId : WarehouseId): WarehouseStateDTO {
    const warehouseId = new WarehouseIdDTO();
    warehouseId.id = wId.getId();
    return {
      warehouseId,    
      state: entity.getState()
    };
  },


  toDTOHeartbeat(entity: Heartbeat): HeartbeatDTO {
    let heartbeatDto = new HeartbeatDTO();
    heartbeatDto.warehouseId = entity.getId();
    heartbeatDto.heartbeatMsg =  entity.getHeartbeatMsg();
    heartbeatDto.timestamp = entity.getTimestamp();
    return heartbeatDto;
  }
};
