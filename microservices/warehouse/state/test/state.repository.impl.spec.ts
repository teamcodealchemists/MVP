import { StateRepositoryMongo } from '../src/interfaces/mongodb/state.repository.impl';
import { WarehouseState } from '../src/domain/warehouse-state.entity';
import { WarehouseId } from '../src/domain/warehouse-id.entity';

describe('StateRepositoryMongo', () => {
  let repository: StateRepositoryMongo;
  let mockStateModel: any;

  beforeEach(() => {
    // Creo un mock di Mongoose Model
    mockStateModel = {
      findOne: jest.fn().mockReturnThis(),
      updateOne: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    repository = new StateRepositoryMongo(mockStateModel);
  });

  it('should return state from the model if found', async () => {
    const warehouseId = new WarehouseId(1);
    const doc = { state: 'ACTIVE' };
    mockStateModel.exec.mockResolvedValueOnce(doc);

    const result = await repository.getState(warehouseId);
    expect(result).toBeInstanceOf(WarehouseState);
    expect(result.getState()).toBe('ACTIVE');
    expect(mockStateModel.findOne).toHaveBeenCalledWith({ warehouseId: 1 });
  });

  it('should return default state "unknown" if not found', async () => {
    const warehouseId = new WarehouseId(2);
    mockStateModel.exec.mockResolvedValueOnce(null);

    const result = await repository.getState(warehouseId);
    expect(result.getState()).toBe('unknown');
  });

  it('should call updateOne and return acknowledged true', async () => {
    const warehouseId = new WarehouseId(3);
    const state = new WarehouseState('INACTIVE');

    mockStateModel.exec.mockResolvedValueOnce({ acknowledged: true });

    const result = await repository.updateState(state, warehouseId);
    expect(mockStateModel.updateOne).toHaveBeenCalledWith(
      { warehouseId: 3 },
      { state: 'INACTIVE' },
      { upsert: true }
    );
    expect(result).toBe(true);
  });

  it('should call updateOne and return acknowledged false', async () => {
    const warehouseId = new WarehouseId(4);
    const state = new WarehouseState('ACTIVE');

    mockStateModel.exec.mockResolvedValueOnce({ acknowledged: false });

    const result = await repository.updateState(state, warehouseId);
    expect(result).toBe(false);
  });
});
