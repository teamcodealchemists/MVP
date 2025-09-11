import { StateAggregateService } from '../../src/application/stateAggregate.service';
import { CloudWarehouseId } from '../../src/domain/cloudWarehouseId.entity';
import { CloudWarehouseState } from '../../src/domain/cloudWarehouseState.entity';
import { CloudHeartbeat } from '../../src/domain/cloudHeartbeat.entity';
import { promiseHooks } from 'v8';

describe('StateAggregateService', () => {
  let service: StateAggregateService;
  let mockRepository: any;
  let mockEventAdapter: any;

  beforeEach(() => {
    mockRepository = {
      getAllWarehouseIds: jest.fn(),
      getState: jest.fn(),
      updateState: jest.fn(),
    };
    mockEventAdapter = {
      publishHeartbeat: jest.fn(),
      publishState: jest.fn(),
    };
    service = new StateAggregateService(mockRepository, mockEventAdapter);
  });

  it('getState chiama il repository', async () => {
    const id = new CloudWarehouseId(1);
    mockRepository.getState.mockResolvedValue(new CloudWarehouseState(id, 'ONLINE'));
    const result = await service.getState(id);
    expect(mockRepository.getState).toHaveBeenCalledWith(id);
    expect(result).not.toBeNull();
    expect(result!.getState()).toBe('ONLINE');
  });

  it('updateState chiama il repository', async () => {
    const state = new CloudWarehouseState(new CloudWarehouseId(2), 'OFFLINE');
    mockRepository.updateState.mockResolvedValue(true);
    const result = await service.updateState(state);
    expect(mockRepository.updateState).toHaveBeenCalledWith(state);
    expect(result).toBe(true);
  });

  it('handleHeartbeatResponse chiama tutte le callback e le pulisce', async () => {
    const id = new CloudWarehouseId(3);
    const cb1 = jest.fn();
    const cb2 = jest.fn();
    service.onHeartbeatResponse(cb1);
    service.onHeartbeatResponse(cb2);
    await service.handleHeartbeatResponse(id, true);
    expect(cb1).toHaveBeenCalledWith(id, true);
    expect(cb2).toHaveBeenCalledWith(id, true);
    expect(service['heartbeatCallbacks'].length).toBe(0);
  });

  it('checkHeartbeat imposta lo stato ONLINE se isAlive è true', async () => {
    const id = new CloudWarehouseId(4);
    mockEventAdapter.publishHeartbeat.mockImplementation(() => {});
    mockRepository.getState.mockResolvedValue(new CloudWarehouseState(id, 'OFFLINE'));
    mockRepository.updateState.mockResolvedValue(true);
    mockEventAdapter.publishState.mockImplementation(() => {});

    // Simula la risposta al heartbeat
    setTimeout(() => {
      service.handleHeartbeatResponse(id, true);
    }, 100);

    const result = await service.checkHeartbeat(id);
    expect(result).toBe('ONLINE');
    expect(mockRepository.updateState).toHaveBeenCalledWith(expect.any(CloudWarehouseState));
    expect(mockEventAdapter.publishState).toHaveBeenCalledWith(expect.any(CloudWarehouseState));
  });

  it('checkHeartbeat imposta lo stato OFFLINE se non arriva risposta', async () => {
    jest.useFakeTimers(); // Usa i timer finti di Jest
    const id = new CloudWarehouseId(5);
    mockEventAdapter.publishHeartbeat.mockImplementation(() => {});
    mockRepository.getState.mockResolvedValue(new CloudWarehouseState(id, 'ONLINE'));
    mockRepository.updateState.mockResolvedValue(true);
    mockEventAdapter.publishState.mockImplementation(() => {});

    const promise = service.checkHeartbeat(id);

    // Avanza il timer fino al timeout interno della funzione (es: 1000ms)
    jest.advanceTimersByTime(11000);
    await jest.runOnlyPendingTimersAsync();
    const result = await promise;
    expect(result).toBe('OFFLINE');
    jest.useRealTimers(); // Ripristina i timer reali
  });

  it('startPeriodicHeartbeatCheck chiama checkHeartbeat per ogni magazzino', async () => {
    const ids = [new CloudWarehouseId(1), new CloudWarehouseId(2)];
    mockRepository.getAllWarehouseIds.mockResolvedValue(ids);
    jest.spyOn(service, 'checkHeartbeat').mockResolvedValue('ONLINE');
    await service.startPeriodicHeartbeatCheck();
    expect(service.checkHeartbeat).toHaveBeenCalledTimes(2);
    expect(service.checkHeartbeat).toHaveBeenCalledWith(ids[0]);
    expect(service.checkHeartbeat).toHaveBeenCalledWith(ids[1]);
  });
});