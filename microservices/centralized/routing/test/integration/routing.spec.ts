import { WarehouseId } from '../../src/domain/warehouseId.entity';
import { WarehouseState } from '../../src/domain/warehouseState.entity';
import { WarehouseAddress} from '../../src/domain/warehouseAddress.entity';

// Implementazione concreta per test
class TestRouting extends WarehouseAddress {
  constructor(
    warehouseAddress: WarehouseAddress,
    warehouseState: WarehouseState,
  ) {
    super(warehouseState, warehouseAddress.getAddress());
  }
}

describe('Integration test tra classi WarehouseId, WarehouseAddress e WarehouseState', () => {
  it('verifica consistenza tra Warehouse e i suoi attributi', () => {
    const warehouseId = new WarehouseId(1);
    const warehouseState = new WarehouseState(warehouseId, 'ATTIVO');
    const warehouseAddress = new WarehouseAddress(warehouseState, 'Via Roma 1, Milano');

    const routing = new TestRouting(warehouseAddress, warehouseState);

    // Testiamo la catena di integrazione
    // Per testare i get
    expect(routing.getId()).toBe(1);
    expect(routing.getAddress()).toBe('Via Roma 1, Milano');
    expect(routing.getWarehouseState()).toBe('ATTIVO');

    // Per testare i set
    routing.setAddress('Via Torino 2, Milano');
    routing.setState('INATTIVO');

    expect(routing.getAddress()).toBe('Via Torino 2, Milano');
    expect(routing.getWarehouseState()).toBe('INATTIVO');
  });
});