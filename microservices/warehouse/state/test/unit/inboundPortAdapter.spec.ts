// src/infrastructure/adapters/portAdapters/inboundPortsAdapter.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { InboundPortsAdapter } from '../../src/infrastructure/adapters/portAdapters/inboundPortAdapters';
import { StateService } from '../../src/application/state.service';
import { DataMapper } from '../../src/infrastructure/mappers/datamapper';
import { WarehouseIdDTO } from '../../src/interfaces/dto/warehouse-id.dto';
import { WarehouseId } from '../../src/domain/warehouse-id.entity';
import { WarehouseState } from '../../src/domain/warehouse-state.entity';

describe('InboundPortsAdapter', () => {
  let adapter: InboundPortsAdapter;
  let stateService: Partial<StateService>;

  beforeEach(async () => {
    stateService = {
      sendHeartBeat: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InboundPortsAdapter,
        { provide: StateService, useValue: stateService },
      ],
    }).compile();

    adapter = module.get<InboundPortsAdapter>(InboundPortsAdapter);
  });

  it('should call sendHeartBeat with correct domain objects', async () => {
    const warehouseIdDTO: WarehouseIdDTO = { id: 1 };
    const domainWarehouseId = new WarehouseId(1);

    // Mock DataMapper
    jest.spyOn(DataMapper, 'toDomainWarehouseId').mockReturnValue(domainWarehouseId);

    await adapter.getSyncedState(warehouseIdDTO);

    expect(DataMapper.toDomainWarehouseId).toHaveBeenCalledWith(warehouseIdDTO);
    expect(stateService.sendHeartBeat).toHaveBeenCalledWith(domainWarehouseId, expect.any(WarehouseState));
    
    const sentState = (stateService.sendHeartBeat as jest.Mock).mock.calls[0][1];
    expect(sentState.getState()).toBe('ONLINE');
  });
});
