import { Heartbeat } from '../../src/domain/heartbeat.entity';
import { WarehouseId } from '../../src/domain/warehouse-id.entity';
import { WarehouseState } from '../../src/domain/warehouse-state.entity';

describe('Entities', () => {
  it('should create a Heartbeat entity', () => {
    const warehouseId = new WarehouseId(1);
    const heartbeat = new Heartbeat('ALIVE', new Date(), warehouseId);

    expect(heartbeat.getHeartbeatMsg()).toBe('ALIVE');
    expect(heartbeat.getId()).toBe(1);
  });

  it('should create a WarehouseState entity', () => {
    const state = new WarehouseState('ACTIVE');

    expect(state.getState()).toBe('ACTIVE');

    state.setState('INACTIVE');
    expect(state.getState()).toBe('INACTIVE');
  });

  it('should create a WarehouseId entity', () => {
    const warehouseId = new WarehouseId(42);
    expect(warehouseId.getId()).toBe(42);
  });
});