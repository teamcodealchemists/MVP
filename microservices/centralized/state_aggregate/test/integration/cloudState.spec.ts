import { CloudWarehouseId } from '../../src/domain/cloudWarehouseId.entity';
import { CloudWarehouseState } from '../../src/domain/cloudWarehouseState.entity';
import { CloudHeartbeat } from '../../src/domain/cloudHeartbeat.entity';
import { StateAggregateService } from '../../src/application/stateAggregate.service';
import { CloudStateEventAdapter } from '../../src/infrastructure/adapters/cloudState.event.adapter';
import { OutboundService } from '../../src/interfaces/outbound.service';
import { NatsService } from '../../src/interfaces/nats/nats.service';

// Mock repository
const mockRepository = {
    getState: jest.fn(),
    updateState: jest.fn(),
    getAllWarehouseIds: jest.fn(), // aggiunto per soddisfare l'interfaccia 
};

class MockNatsService extends NatsService {
    onModuleInit = jest.fn();
    onModuleDestroy = jest.fn();
    publish = jest.fn();
}

class MockOutboundService extends OutboundService {
    constructor(natsService: NatsService) {
        super(natsService);
    }
    // Rendi la proprietà pubblica per il mock
    publishHeartbeat = jest.fn();
    publishState = jest.fn();
    stateUpdated = jest.fn();
}

const mockNatsService = new MockNatsService();

const mockOutboundService = new MockOutboundService(mockNatsService);

class MockCloudStateEventAdapter extends CloudStateEventAdapter {
    publishHeartbeat = jest.fn();
    publishState = jest.fn();
    stateUpdated = jest.fn();
}
// Mock event adapter (se serve)
const mockEventAdapter = new MockCloudStateEventAdapter(mockOutboundService);


describe('Integration test tra CloudWarehouseId, CloudWarehouseState e CloudHeartbeat', () => {
  it('verifica consistenza tra CloudWarehouse e i suoi attributi', () => {
    const warehouseId = new CloudWarehouseId(1);
    const warehouseState = new CloudWarehouseState(warehouseId, 'ONLINE');
    const heartbeat = new CloudHeartbeat(warehouseId, 'ALIVE', new Date());
    const stateAggregateService = new StateAggregateService(mockRepository, mockEventAdapter);

    // Testiamo la catena di integrazione
    expect(warehouseState.getId().getId()).toBe(1);
    expect(warehouseState.getState()).toBe('ONLINE');
    expect(heartbeat.getId().getId()).toBe(1);
    expect(heartbeat.getHeartbeatMsg()).toBe('ALIVE');

    // Simula il service che cambia lo stato
    mockRepository.updateState.mockResolvedValue(true);
    mockRepository.getState.mockResolvedValue(new CloudWarehouseState(warehouseId, 'OFFLINE'));
    stateAggregateService.updateState(new CloudWarehouseState(warehouseId, 'OFFLINE'));
    const updatedState = stateAggregateService.getState(warehouseId);
    expect(updatedState).toBe('OFFLINE');
  });
});