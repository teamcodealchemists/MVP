import { StateAggregateController } from '../../src/interfaces/stateAggregate.controller';
import { StateAggregateService } from '../../src/application/stateAggregate.service';
import { CloudWarehouseId } from '../../src/domain/cloudWarehouseId.entity';
import { CloudWarehouseState } from '../../src/domain/cloudWarehouseState.entity';
import { CloudHeartbeatDTO } from '../../src/interfaces/dto/cloudHeartbeat.dto';

describe('StateAggregateController', () => {
  let controller: StateAggregateController;
  let mockService: any;

  beforeEach(() => {
    mockService = {
      handleHeartbeatResponse: jest.fn(),
      getState: jest.fn(),
      updateState: jest.fn(),
      notifyStateUpdated: jest.fn(),
      publishState: jest.fn(),
    };
    controller = new StateAggregateController(mockService);
  });

  describe('syncReceivedHeartbeat', () => {
    it('chiama handleHeartbeatResponse con i parametri corretti', async () => {
      mockService.handleHeartbeatResponse.mockResolvedValue('OK');
      const dto: CloudHeartbeatDTO = {
        warehouseId: 1,
        heartbeatmsg: 'ONLINE',
        timestamp: new Date('2025-09-07T16:34:56.789Z'),
      };
      const result = await controller.syncReceivedHeartbeat(dto);
      expect(mockService.handleHeartbeatResponse).toHaveBeenCalledWith(
        expect.any(CloudWarehouseId),
        true
      );
      expect(result).toBe('OK');
    });

    it('gestisce errori e restituisce un JSON di errore', async () => {
      mockService.handleHeartbeatResponse.mockImplementation(() => { throw new Error('fail'); });
      const dto: CloudHeartbeatDTO = {
        warehouseId: 1,
        heartbeatmsg: 'ONLINE',
        timestamp: new Date('2025-09-07T16:34:56.789Z'),
      };
      const result = await controller.syncReceivedHeartbeat(dto);
      expect(JSON.parse(result).error.code).toBe('system.invalidParams');
    });
  });

  describe('updateState', () => {
    it('aggiorna lo stato se diverso e chiama notifyStateUpdated', async () => {
      mockService.getState.mockResolvedValue(new CloudWarehouseState(new CloudWarehouseId(1), 'ONLINE'));
      mockService.updateState.mockResolvedValue(true);
      const data: { warehouseId: number, newState: 'ONLINE' | 'OFFLINE' } = { warehouseId: 1, newState: 'OFFLINE' };
      const result = await controller.updateState(data);
      expect(mockService.updateState).toHaveBeenCalledWith(expect.any(CloudWarehouseState));
      expect(mockService.notifyStateUpdated).toHaveBeenCalledWith(expect.any(CloudWarehouseState));
      expect(JSON.parse(result).result).toBe('Address updated successfully');
    });

    it('non aggiorna lo stato se uguale', async () => {
      mockService.getState.mockResolvedValue(new CloudWarehouseState(new CloudWarehouseId(1), 'OFFLINE'));
      const data: { warehouseId: number, newState: 'ONLINE' | 'OFFLINE' } = { warehouseId: 1, newState: 'OFFLINE' };
      const result = await controller.updateState(data);
      expect(mockService.updateState).not.toHaveBeenCalled();
      expect(mockService.notifyStateUpdated).not.toHaveBeenCalled();
      expect(JSON.parse(result).result).toBe('Address updated successfully');
    });

    it('gestisce errori e restituisce un JSON di errore', async () => {
      mockService.getState.mockImplementation(() => { throw new Error('fail'); });
      const data: { warehouseId: number, newState: 'ONLINE' | 'OFFLINE' } = { warehouseId: 1, newState: 'ONLINE' };
      const result = await controller.updateState(data);
      expect(JSON.parse(result).error.code).toBe('system.invalidParams');
    });
  });

  describe('getState', () => {
    it('restituisce lo stato e chiama publishState', async () => {
      const state = new CloudWarehouseState(new CloudWarehouseId(1), 'ONLINE');
      mockService.getState.mockResolvedValue(state);
      const data = { warehouseId: 1 };
      const result = await controller.getState(data);
      expect(mockService.publishState).toHaveBeenCalledWith(state);
      const parsed = JSON.parse(result);
      expect(parsed.result.warehouseId).toBe(1);
      expect(parsed.result.state).toBe('ONLINE');
    });

    it('restituisce stringa se non trova lo stato', async () => {
      mockService.getState.mockResolvedValue(null);
      const data = { warehouseId: 1 };
      const result = await controller.getState(data);
      const parsed = JSON.parse(result);
      expect(parsed.result).toBe("No state found for the given warehouseId");
    });

    it('gestisce errori e restituisce un JSON di errore', async () => {
      mockService.getState.mockImplementation(() => { throw new Error('fail'); });
      const data = { warehouseId: 1 };
      const result = await controller.getState(data);
      const parsed = JSON.parse(result);
      expect(parsed.error.code).toBe('system.invalidParams');
    });
  });
});