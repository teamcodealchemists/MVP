import { Test, TestingModule } from '@nestjs/testing';
import { StateService } from '../src/application/state.service';
import { StateRepository } from '../src/domain/mongodb/state.repository';
import { WarehouseId } from '../src/domain/warehouse-id.entity';
import { WarehouseState } from '../src/domain/warehouse-state.entity';

describe('StateService', () => {
  let service: StateService;
  let repository: jest.Mocked<StateRepository>;

  beforeEach(async () => {
    // Mock completo del repository
    repository = {
      getState: jest.fn(),
      updateState: jest.fn(),
    } as unknown as jest.Mocked<StateRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StateService,
        { provide: 'STATEREPOSITORY', useValue: repository },
      ],
    }).compile();

    service = module.get<StateService>(StateService);
  });

  describe('getState', () => {
    it('ritorna lo stato se esiste', async () => {
      const warehouseId = new WarehouseId(1);
      const state = new WarehouseState('active');
      repository.getState.mockResolvedValue(state);

      const result = await service.getState(warehouseId);

      expect(repository.getState).toHaveBeenCalledWith(warehouseId);
      expect(result).toBe(state);
    });

    it('ritorna null se non esiste lo stato', async () => {
      const warehouseId = new WarehouseId(1);
      repository.getState.mockResolvedValue(null);

      const result = await service.getState(warehouseId);

      expect(result).toBeNull();
    });
  });

  describe('updateState', () => {
    it('ritorna true se aggiornamento avviene con successo', async () => {
      const warehouseId = new WarehouseId(1);
      const state = new WarehouseState('inactive');
      repository.updateState.mockResolvedValue(true);

      const result = await service.updateState(state, warehouseId);

      expect(repository.updateState).toHaveBeenCalledWith(state, warehouseId);
      expect(result).toBe(true);
    });
  });
});