// src/interfaces/state-event.handler.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { StateEventHandler } from '../../src/interfaces/state-event.handler';
import { ClientProxy } from '@nestjs/microservices';
import { WarehouseId } from '../../src/domain/warehouse-id.entity';
import { WarehouseState } from '../../src/domain/warehouse-state.entity';
import { HeartbeatDTO } from '../../src/interfaces/dto/heartbeat.dto';

describe('StateEventHandler', () => {
  let handler: StateEventHandler;
  let natsClient: Partial<ClientProxy>;

  beforeEach(async () => {
    natsClient = {
      connect: jest.fn().mockResolvedValue(undefined),
      emit: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StateEventHandler,
        { provide: 'NATS_SERVICE', useValue: natsClient },
      ],
    }).compile();

    handler = module.get<StateEventHandler>(StateEventHandler);
  });

  it('should call connect on module init', async () => {
    await handler.onModuleInit();
    expect(natsClient.connect).toHaveBeenCalled();
  });

  it('should publish heartbeat', async () => {
    const dto: HeartbeatDTO = { heartbeatMsg: 'ONLINE', timestamp: new Date(), warehouseId: 1 };
    await handler.publishHeartbeat(dto);

    expect(natsClient.emit).toHaveBeenCalledWith(
      `call.cloudState.warehouse.${dto.warehouseId}.heartbeat.response`,
      dto
    );
  });

  it('should publish warehouse state', async () => {
    const warehouseId = new WarehouseId(2);
    const state = new WarehouseState('ONLINE');

    await handler.publishState(warehouseId, state);

    expect(natsClient.emit).toHaveBeenCalledWith(
      `state.get.${warehouseId}`,
      {
        warehouseId: warehouseId,
        state: state.getState(),
      }
    );
  });

  it('should publish updated state', async () => {
    const warehouseId = 3;
    const state = new WarehouseState('OFFLINE');

    await handler.stateUpdated(state, warehouseId);

    expect(natsClient.emit).toHaveBeenCalledWith(
      `state.updated.${warehouseId}`,
      {
        warehouseId: warehouseId,
        state: state.getState(),
      }
    );
  });
});
