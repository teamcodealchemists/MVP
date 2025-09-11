import { DataMapper } from '../../src/interfaces/data.mapper';
import { WarehouseIdDTO } from '../../src/interfaces/dto/warehouseId.dto';
import { WarehouseStateDTO } from '../../src/interfaces/dto/warehouseState.dto';
import { WarehouseAddressDTO } from '../../src/interfaces/dto/warehouseAddress.dto';
import { WarehouseId } from '../../src/domain/warehouseId.entity';
import { WarehouseState } from '../../src/domain/warehouseState.entity';
import { WarehouseAddress } from '../../src/domain/warehouseAddress.entity';

//DATA MAPPER TESTS
describe('DataMapper', () => {
  it('warehouseIdToDomain converte DTO in entity', () => {
    const dto: WarehouseIdDTO = { warehouseId: 42 };
    const entity = DataMapper.warehouseIdToDomain(dto);
    expect(entity).toBeInstanceOf(WarehouseId);
    expect(entity.getId()).toBe(42);
  });

  it('warehouseStateToDomain converte DTO in entity', () => {
    const dto: WarehouseStateDTO = {
      warehouseId: { warehouseId: 7 },
      state: 'ATTIVO',
    };
    const entity = DataMapper.warehouseStateToDomain(dto);
    expect(entity).toBeInstanceOf(WarehouseState);
    expect(entity.getId().getId()).toBe(7);
    expect(entity.getState()).toBe('ATTIVO');
  });

  it('warehouseAddressToDomain converte DTO in entity', () => {
    const dto: WarehouseAddressDTO = {
      warehouseState: {
        warehouseId: { warehouseId: 5 },
        state: 'DISATTIVO',
      },
      address: 'Via Roma 5',
    };
    const entity = DataMapper.warehouseAddressToDomain(dto);
    expect(entity).toBeInstanceOf(WarehouseAddress);
    expect(entity.getWarehouseState().getId().getId()).toBe(5);
    expect(entity.getWarehouseState().getState()).toBe('DISATTIVO');
    expect(entity.getAddress()).toBe('Via Roma 5');
  });

  it('warehouseAddressToDTO converte entity in DTO', () => {
    const id = new WarehouseId(8);
    const state = new WarehouseState(id, 'ATTIVO');
    const address = new WarehouseAddress(state, 'Via Milano 8');
    const dto = DataMapper.warehouseAddressToDTO(address);
    expect(dto).toEqual({
      warehouseState: {
        warehouseId: { warehouseId: 8 },
        state: 'ATTIVO',
      },
      address: 'Via Milano 8',
    });
  });

  it('warehouseIdToDTO converte entity in DTO', () => {
    const id = new WarehouseId(99);
    const dto = DataMapper.warehouseIdToDTO(id);
    expect(dto).toEqual({ warehouseId: 99 });
  });

  it('warehouseStateToDTO converte entity in DTO', () => {
    const id = new WarehouseId(77);
    const state = new WarehouseState(id, 'DISATTIVO');
    const dto = DataMapper.warehouseStateToDTO(state);
    expect(dto).toEqual({
      warehouseId: { warehouseId: 77 },
      state: 'DISATTIVO',
    });
  });
});

//OUTBOUND SERVICE TESTS
import { OutboundService } from '../../src/interfaces/outbound.service';
import { NatsService } from '../../src/interfaces/nats/nats.service';

describe('OutboundService', () => {
  let natsService: NatsService;
  let service: OutboundService;

  beforeEach(() => {
    natsService = {
      publish: jest.fn(),
    } as unknown as NatsService;
    service = new OutboundService(natsService);
  });

  it('sendAddress chiama natsService.publish con il topic e il payload giusto', async () => {
    const address: WarehouseAddressDTO = {
      warehouseState: {
        warehouseId: { warehouseId: 1 },
        state: 'ATTIVO',
      },
      address: 'Via Roma 1',
    };
    await service.sendAddress(address);
    expect(natsService.publish).toHaveBeenCalledWith('warehouse.address', address);
  });

  it('sendWarehouseDistance chiama natsService.publish con il topic e il payload giusto', async () => {
    const ids: WarehouseIdDTO[] = [
      { warehouseId: 1 },
      { warehouseId: 2 },
    ];
    await service.sendWarehouseDistance(ids);
    expect(natsService.publish).toHaveBeenCalledWith('warehouse.distance', [ids]);
  });
});
