// src/application/state.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { StateService } from '../../src/application/state.service';
import { OutboundPortsAdapter } from '../../src/infrastructure/adapters/portAdapters/outboundPortAdapters';
import { StateRepository } from '../../src/domain/mongodb/state.repository';
import { WarehouseId } from '../../src/domain/warehouse-id.entity';
import { WarehouseState } from '../../src/domain/warehouse-state.entity';
import { Heartbeat } from '../../src/domain/heartbeat.entity';

describe('StateService', () => {
  let service: StateService;
  let outboundPortAdapter: Partial<OutboundPortsAdapter>;
  let stateRepository: Partial<StateRepository>;

  beforeEach(async () => {
    // Mock dell'OutboundPortsAdapter
    outboundPortAdapter = {
      publishHeartbeat: jest.fn(),
    };

    // Mock del repository
    stateRepository = {
      getState: jest.fn(),
      updateState: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StateService,
        { provide: 'STATEREPOSITORY', useValue: stateRepository },
        { provide: OutboundPortsAdapter, useValue: outboundPortAdapter },
      ],
    }).compile();

    service = module.get<StateService>(StateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a Heartbeat with correct message using syncHeartbeat', async () => {
    const warehouseId = new WarehouseId(1);
    const warehouseState = new WarehouseState('ONLINE');

    const heartbeat: Heartbeat = await service.syncHeartbeat(warehouseId, warehouseState);

    expect(heartbeat).toBeInstanceOf(Heartbeat);
    expect(heartbeat.getHeartbeatMsg()).toContain('ONLINE');
    expect(heartbeat.getId()).toBe(warehouseId.getId());
    expect(heartbeat.getTimestamp()).toBeInstanceOf(Date);
  });

  it('should call publishHeartbeat with Heartbeat using sendHeartBeat', async () => {
    const warehouseId = new WarehouseId(1);
    const warehouseState = new WarehouseState('ONLINE');

    await service.sendHeartBeat(warehouseId, warehouseState);

    // Verifica che publishHeartbeat sia stato chiamato
    expect(outboundPortAdapter.publishHeartbeat).toHaveBeenCalledTimes(1);

    // Controlla il contenuto del Heartbeat pubblicato
    const publishedHeartbeat = (outboundPortAdapter.publishHeartbeat as jest.Mock).mock.calls[0][0];
    expect(publishedHeartbeat).toBeInstanceOf(Heartbeat);
    expect(publishedHeartbeat.heartbeatMsg).toContain('ONLINE');
    expect(publishedHeartbeat.warehouseId).toBe(warehouseId);
    expect(publishedHeartbeat.timestamp).toBeInstanceOf(Date);
  });
});
