import 'reflect-metadata';
import { DataMapper } from '../../src/interfaces/data.mapper';
import { CloudWarehouseIdDTO } from '../../src/interfaces/dto/cloudWarehouseId.dto';
import { CloudWarehouseStateDTO } from '../../src/interfaces/dto/cloudWarehouseState.dto';
import { CloudHeartbeatDTO } from '../../src/interfaces/dto/cloudHeartbeat.dto';
import { CloudWarehouseId } from '../../src/domain/cloudWarehouseId.entity';
import { CloudWarehouseState } from '../../src/domain/cloudWarehouseState.entity';
import { CloudHeartbeat } from '../../src/domain/cloudHeartbeat.entity';

describe('DataMapper', () => {
  it('cloudWarehouseIdToDomain converte DTO in Domain', () => {
    const dto: CloudWarehouseIdDTO = { warehouseId: 1 };
    const domain = DataMapper.cloudWarehouseIdToDomain(dto);
    expect(domain).toBeInstanceOf(CloudWarehouseId);
    expect(domain.getId()).toBe(1);
  });

  it('cloudWarehouseStateToDomain converte DTO in Domain', () => {
    const dto: CloudWarehouseStateDTO = { warehouseId: 2, state: 'ONLINE' };
    const domain = DataMapper.cloudWarehouseStateToDomain(dto);
    expect(domain).toBeInstanceOf(CloudWarehouseState);
    expect(domain.getId().getId()).toBe(2);
    expect(domain.getState()).toBe('ONLINE');
  });

  it('cloudHeartbeatToDomain converte DTO in Domain', () => {
    const dto: CloudHeartbeatDTO = { warehouseId: 3, heartbeatmsg: 'ALIVE', timestamp: new Date('2025-09-07T16:34:56.789Z') };
    const domain = DataMapper.cloudHeartbeatToDomain(dto);
    expect(domain).toBeInstanceOf(CloudHeartbeat);
    expect(domain.getId().getId()).toBe(3);
    expect(domain.getHeartbeatMsg()).toBe('ALIVE');
    expect(domain.getTimestamp()).toEqual(new Date('2025-09-07T16:34:56.789Z'));
  });

  it('cloudWarehouseIdToDTO converte Domain in DTO', () => {
    const domain = new CloudWarehouseId(4);
    const dto = DataMapper.cloudWarehouseIdToDTO(domain);
    expect(dto).toEqual({ warehouseId: 4 });
  });

  it('cloudWarehouseStateToDTO converte Domain in DTO', () => {
    const domain = new CloudWarehouseState(new CloudWarehouseId(5), 'OFFLINE');
    const dto = DataMapper.cloudWarehouseStateToDTO(domain);
    expect(dto).toEqual({ warehouseId: 5, state: 'OFFLINE' });
  });

  it('cloudHeartbeatToDTO converte Domain in DTO', () => {
    const domain = new CloudHeartbeat(new CloudWarehouseId(6), 'ALIVE', new Date('2025-09-07T16:34:56.789Z'));
    const dto = DataMapper.cloudHeartbeatToDTO(domain);
    expect(dto).toEqual({ warehouseId: 6, heartbeatmsg: 'ALIVE', timestamp: new Date('2025-09-07T16:34:56.789Z') });
  });
});


import { OutboundService } from '../../src/interfaces/outbound.service';

describe('OutboundService', () => {
  let natsService: any;
  let service: OutboundService;

  beforeEach(() => {
    natsService = { publish: jest.fn() };
    service = new OutboundService(natsService);
  });

  it('publishHeartbeat chiama natsService.publish con il topic corretto', () => {
    const heartbeat: CloudHeartbeatDTO = { warehouseId: 1, heartbeatmsg: 'ONLINE', timestamp: new Date() };
    service.publishHeartbeat(heartbeat);
    expect(natsService.publish).toHaveBeenCalledWith('cloud.checkHeartbeat', heartbeat);
  });

  it('publishState chiama natsService.publish con il topic corretto', () => {
    const state: CloudWarehouseStateDTO = { warehouseId: 2, state: 'OFFLINE' };
    service.publishState(state);
    expect(natsService.publish).toHaveBeenCalledWith('cloud.state', state);
  });

  it('stateUpdated chiama natsService.publish con il topic corretto', () => {
    const state: CloudWarehouseStateDTO = { warehouseId: 3, state: 'ONLINE' };
    service.stateUpdated(state);
    expect(natsService.publish).toHaveBeenCalledWith('cloud.stateUpdated', state);
  });
});

//TEST SU CLOUDWAREHOUSESTATEDTO
import { validate } from 'class-validator';

describe('CloudWarehouseStateDTO', () => {
  it('valida un DTO corretto', async () => {
    const dto = new CloudWarehouseStateDTO();
    dto.warehouseId = 1;
    dto.state = 'ONLINE';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('non valida se warehouseId è negativo', async () => {
    const dto = new CloudWarehouseStateDTO();
    dto.warehouseId = -1;
    dto.state = 'ONLINE';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('warehouseId');
  });

  it('non valida se warehouseId è mancante', async () => {
    const dto = new CloudWarehouseStateDTO();
    // dto.warehouseId non impostato
    dto.state = 'ONLINE';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('warehouseId');
  });

  it('non valida se state è mancante', async () => {
    const dto = new CloudWarehouseStateDTO();
    dto.warehouseId = 1;
    // dto.state non impostato
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('state');
  });

  it('non valida se state non è una stringa', async () => {
    const dto = new CloudWarehouseStateDTO();
    dto.warehouseId = 1;
    // @ts-ignore
    dto.state = 123;
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('state');
  });
});