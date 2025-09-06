import { InboundPortsAdapter } from '../src/infrastructure/adapters/portAdapters/inboundPortAdapters';
import { StateService } from '../src/application/state.service';
import { StateEventHandler } from '../src/interfaces/state-event.handler';
import { DataMapper } from '../src/infrastructure/mappers/datamapper';
import { WarehouseIdDTO } from '../src/interfaces/dto/warehouse-id.dto';
import { WarehouseState } from '../src/domain/warehouse-state.entity';
import { Heartbeat } from '../src/domain/heartbeat.entity';

describe('InboundPortsAdapter', () => {
  let adapter: InboundPortsAdapter;
  let stateService: jest.Mocked<StateService>;
  let stateEventHandler: jest.Mocked<StateEventHandler>;

  beforeEach(() => {
    stateService = { getState: jest.fn(), updateState: jest.fn() } as any;
    stateEventHandler = { publishHeartbeat: jest.fn() } as any;

    adapter = new InboundPortsAdapter(stateService, stateEventHandler);
  });

  it('ritorna unknown se lo stato non esiste', async () => {
    const dto: WarehouseIdDTO = { id: 1 };
    stateService.getState.mockResolvedValue(null);

    const result = await adapter.getSyncedState(dto);

    expect(result).toEqual({ state: 'unknown' });
    expect(stateEventHandler.publishHeartbeat).not.toHaveBeenCalled();
  });

  it('ritorna DTO e pubblica heartbeat se lo stato esiste', async () => {
    const dto: WarehouseIdDTO = { id: 1 };
    const warehouseState = new WarehouseState('active');
    stateService.getState.mockResolvedValue(warehouseState);

    // Mock DataMapper static methods
    jest.spyOn(DataMapper, 'toDomainWarehouseId').mockReturnValue({ getId: () => 1 } as any);
    jest.spyOn(DataMapper, 'toDTOWarehouseState').mockReturnValue({ state: 'active' });

    const result = await adapter.getSyncedState(dto);

    expect(result).toEqual({ state: 'active' });
    expect(stateEventHandler.publishHeartbeat).toHaveBeenCalled();
  });
});
