import { DataMapper } from '../src/infrastructure/mappers/datamapper';
import { WarehouseId } from '../src/domain/warehouse-id.entity';
import { WarehouseState } from '../src/domain/warehouse-state.entity';
import { Heartbeat } from '../src/domain/heartbeat.entity';


describe('DataMapper', () => {
  it('should map WarehouseIdDTO to WarehouseId entity', () => {
    const dto = { id: 42 };
    const entity = DataMapper.toDomainWarehouseId(dto);
    expect(entity).toBeInstanceOf(WarehouseId);
    expect(entity.getId()).toBe(42);
  });

  it('should map WarehouseStateDTO to WarehouseState entity', () => {
    const dto = { state: 'ACTIVE' };
    const entity = DataMapper.toDomainWarehouseState(dto);
    expect(entity).toBeInstanceOf(WarehouseState);
    expect(entity.getState()).toBe('ACTIVE');
  });

  it('should map HeartbeatDTO to Heartbeat entity', () => {
    const dto = { warehouseId: 1, heartbeatMsg: 'ALIVE', timestamp: new Date() };
    const entity = DataMapper.toDomainHeartbeat(dto);
    expect(entity).toBeInstanceOf(Heartbeat);
    expect(entity.getId()).toBe(1);
    expect(entity.getHeartbeatMsg()).toBe('ALIVE');
    expect(entity.getTimestamp()).toBe(dto.timestamp);
  });

  it('should map WarehouseId entity to DTO', () => {
    const entity = new WarehouseId(99);
    const dto = DataMapper.toDTOWarehouseId(entity);
    expect(dto).toEqual({ id: 99 });
  });

  it('should map WarehouseState entity to DTO', () => {
    const entity = new WarehouseState('INACTIVE');
    const dto = DataMapper.toDTOWarehouseState(entity);
    expect(dto).toEqual({ state: 'INACTIVE' });
  });

  it('should map Heartbeat entity to DTO', () => {
    const entity = new Heartbeat('ALIVE', new Date(), new WarehouseId(7));
    const dto = DataMapper.toDTOHeartbeat(entity);
    expect(dto.heartbeatMsg).toBe('ALIVE');
    expect(dto.warehouseId).toBe(7);
    expect(dto.timestamp).toBe(entity.getTimestamp());
  });
});
