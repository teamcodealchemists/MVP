// src/interfaces/mongodb/state.repository.impl.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { StateRepositoryMongo } from '../../src/interfaces/mongodb/state.repository.impl';
import { getModelToken } from '@nestjs/mongoose';
import { WarehouseState } from '../../src/domain/warehouse-state.entity';

describe('StateRepositoryMongo', () => {
  let repository: StateRepositoryMongo;
  let stateModel: any;

  beforeEach(async () => {
    const mockStateModel = {
      findOne: jest.fn(),
      updateOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StateRepositoryMongo,
        { provide: getModelToken('State'), useValue: mockStateModel },
      ],
    }).compile();

    repository = module.get<StateRepositoryMongo>(StateRepositoryMongo);
    stateModel = module.get(getModelToken('State'));
  });

  describe('getState', () => {
    it('should return a WarehouseState from document', async () => {
      const mockDoc = { state: 'ACTIVE' };
      stateModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockDoc) });

      const result = await repository.getState({ getId: () => 1 } as any);

      expect(result).toBeInstanceOf(WarehouseState);
      expect(result.getState()).toBe('ACTIVE');
      expect(stateModel.findOne).toHaveBeenCalledWith({ warehouseId: 1 });
    });

    it('should return default "unknown" state if not found', async () => {
      stateModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      const result = await repository.getState({ getId: () => 2 } as any);

      expect(result).toBeInstanceOf(WarehouseState);
      expect(result.getState()).toBe('unknown');
      expect(stateModel.findOne).toHaveBeenCalledWith({ warehouseId: 2 });
    });
  });

  describe('updateState', () => {
    it('should return true if update acknowledged', async () => {
      const mockResult = { acknowledged: true };
      stateModel.updateOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockResult) });

      const result = await repository.updateState({ getState: () => 'ACTIVE' } as any, { getId: () => 1 } as any);

      expect(result).toBe(true);
      expect(stateModel.updateOne).toHaveBeenCalledWith(
        { warehouseId: 1 },
        { state: 'ACTIVE' },
        { upsert: true }
      );
    });

    it('should return false if update not acknowledged', async () => {
      const mockResult = { acknowledged: false };
      stateModel.updateOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockResult) });

      const result = await repository.updateState({ getState: () => 'INACTIVE' } as any, { getId: () => 3 } as any);

      expect(result).toBe(false);
      expect(stateModel.updateOne).toHaveBeenCalledWith(
        { warehouseId: 3 },
        { state: 'INACTIVE' },
        { upsert: true }
      );
    });
  });
});
