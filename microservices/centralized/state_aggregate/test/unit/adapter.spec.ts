import { CloudStateEventAdapter } from '../../src/infrastructure/adapters/cloudState.event.adapter';
import { OutboundService } from '../../src/interfaces/outbound.service';
import { CloudHeartbeat } from '../../src/domain/cloudHeartbeat.entity';
import { CloudWarehouseState } from '../../src/domain/cloudWarehouseState.entity';

describe('CloudStateEventAdapter', () => {
  let outboundService: any;
  let adapter: CloudStateEventAdapter;

  beforeEach(() => {
    outboundService = {
      publishHeartbeat: jest.fn(),
      publishState: jest.fn(),
      stateUpdated: jest.fn(),
    };
    adapter = new CloudStateEventAdapter(outboundService);
  });

  it('publishHeartbeat chiama outboundService.publishHeartbeat con DTO', () => {
    const heartbeat = new CloudHeartbeat(new CloudWarehouseId(1) , 'ALIVE', new Date('2025-09-07T16:34:56.789Z'));
    adapter.publishHeartbeat(heartbeat);
    expect(outboundService.publishHeartbeat).toHaveBeenCalledWith(
      expect.objectContaining({
        warehouseId: 1,
        heartbeatmsg: 'ALIVE',
        timestamp: new Date('2025-09-07T16:34:56.789Z')
      })
    );
  });

  it('publishState chiama outboundService.publishState con DTO', () => {
    const state = new CloudWarehouseState(new CloudWarehouseId(2), 'ONLINE');
    adapter.publishState(state);
    expect(outboundService.publishState).toHaveBeenCalledWith(
      expect.objectContaining({
        warehouseId: 2,
        state: 'ONLINE'
      })
    );
  });

  it('stateUpdated chiama outboundService.stateUpdated con DTO', () => {
    const state = new CloudWarehouseState(new CloudWarehouseId(3), 'OFFLINE');
    adapter.stateUpdated(state);
    expect(outboundService.stateUpdated).toHaveBeenCalledWith(
      expect.objectContaining({
        warehouseId: 3,
        state: 'OFFLINE'
      })
    );
  });
});

import { CloudStateRepositoryMongo } from '../../src/infrastructure/adapters/mongodb/cloudState.repository.impl';
import { CloudWarehouseId } from '../../src/domain/cloudWarehouseId.entity';

describe('CloudStateRepositoryMongo', () => {
  let model: any;
  let repo: CloudStateRepositoryMongo;

  beforeEach(() => {
    model = {
      findOne: jest.fn(),
      updateOne: jest.fn(),
      find: jest.fn(),
    };
    repo = new CloudStateRepositoryMongo(model);
  });

  it('getState restituisce CloudWarehouseState se trovato', async () => {
    const id = new CloudWarehouseId(1);
    model.findOne.mockReturnValue({ exec: () => Promise.resolve({ state: 'ONLINE' }) });
    const result = await repo.getState(id);
    expect(result).toBeInstanceOf(CloudWarehouseState);
    expect(result!.getState()).toBe('ONLINE');
  });

  it('getState restituisce null se non trovato', async () => {
    const id = new CloudWarehouseId(2);
    model.findOne.mockReturnValue({ exec: () => Promise.resolve(null) });
    const result = await repo.getState(id);
    expect(result).toBeNull();
  });

  it('updateState restituisce true se acknowledged', async () => {
    const state = new CloudWarehouseState(new CloudWarehouseId(3), 'OFFLINE');
    model.updateOne.mockReturnValue({ exec: () => Promise.resolve({ acknowledged: true }) });
    const result = await repo.updateState(state);
    expect(result).toBe(true);
  });

  it('updateState restituisce false se non acknowledged', async () => {
    const state = new CloudWarehouseState(new CloudWarehouseId(4), 'ONLINE');
    model.updateOne.mockReturnValue({ exec: () => Promise.resolve({ acknowledged: false }) });
    const result = await repo.updateState(state);
    expect(result).toBe(false);
  });

  it('getAllWarehouseIds restituisce array di CloudWarehouseId', async () => {
    model.find.mockReturnValue({ exec: () => Promise.resolve([{ cloudWarehouseId: 5 }, { cloudWarehouseId: 6 }]) });
    const result = await repo.getAllWarehouseIds();
    expect(result).toHaveLength(2);
    expect(result[0]).toBeInstanceOf(CloudWarehouseId);
    expect(result[1].getId()).toBe(6);
  });
});