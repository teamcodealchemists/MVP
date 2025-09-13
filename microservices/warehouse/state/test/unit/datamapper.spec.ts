import 'reflect-metadata';
import { DataMapper } from '../../src/infrastructure/mappers/datamapper';
import { WarehouseIdDTO } from '../../src/interfaces/dto/warehouse-id.dto';
import { WarehouseStateDTO } from '../../src/interfaces/dto/warehouse-state.dto';
import { HeartbeatDTO } from '../../src/interfaces/dto/heartbeat.dto';
import { WarehouseId } from '../../src/domain/warehouse-id.entity';
import { WarehouseState } from '../../src/domain/warehouse-state.entity';
import { Heartbeat } from '../../src/domain/heartbeat.entity';

describe('DataMapper', () => {
  it('should map WarehouseIdDTO to WarehouseId domain', () => {
    const dto: WarehouseIdDTO = { id: 5 };
    const entity = DataMapper.toDomainWarehouseId(dto);

    expect(entity).toBeInstanceOf(WarehouseId);
    expect(entity.getId()).toBe(5);
  });

  it('should map WarehouseStateDTO to WarehouseState domain', () => {
    const dto: WarehouseStateDTO = { warehouseId: { id: 1 }, state: 'ACTIVE' };
    const entity = DataMapper.toDomainWarehouseState(dto);

    expect(entity).toBeInstanceOf(WarehouseState);
    expect(entity.getState()).toBe('ACTIVE');
  });

  it('should map HeartbeatDTO to Heartbeat domain', () => {
    const now = new Date();
    const dto: HeartbeatDTO = { warehouseId: 1 , heartbeatMsg: 'ALIVE', timestamp: now};
    const entity = DataMapper.toDomainHeartbeat(dto);

    expect(entity).toBeInstanceOf(Heartbeat);
    expect(entity.getHeartbeatMsg()).toBe('ALIVE');
    expect(entity.getTimestamp()).toBe(now);
    expect(entity.getId()).toBe(1);
  });

  it('should map WarehouseId domain to WarehouseIdDTO', () => {
    const entity = new WarehouseId(10);
    const dto = DataMapper.toDTOWarehouseId(entity);

    expect(dto).toEqual({ id: 10 });
  });

  it('should map WarehouseState domain to WarehouseStateDTO', () => {
    const entity = new WarehouseState('ACTIVE');
    const wId = new WarehouseId(3);
    const dto = DataMapper.toDTOWarehouseState(entity, wId);

    expect(dto.state).toBe('ACTIVE');
    expect(dto.warehouseId.id).toBe(3);
  });

  it('should map Heartbeat domain to HeartbeatDTO', () => {
    const wId = new WarehouseId(7);
    const entity = new Heartbeat( wId,'ALIVE', new Date());
    const dto = DataMapper.toDTOHeartbeat(entity);

    expect(dto).toBeInstanceOf(HeartbeatDTO);
    expect(dto.heartbeatMsg).toBe('ALIVE');
    expect(dto.warehouseId).toBe(7);
    expect(dto.timestamp).toBeInstanceOf(Date);
  });
});
