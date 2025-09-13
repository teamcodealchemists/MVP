// src/interfaces/http/state.controller.spec.ts
import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { StateController } from '../../src/interfaces/state.controller';
import { InboundPortsAdapter } from '../../src/infrastructure/adapters/portAdapters/inboundPortAdapters';

describe('StateController', () => {
  let controller: StateController;
  let inboundAdapter: Partial<InboundPortsAdapter>;

  beforeEach(async () => {
    inboundAdapter = {
      getSyncedState: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StateController],
      providers: [
        { provide: InboundPortsAdapter, useValue: inboundAdapter },
      ],
    }).compile();

    controller = module.get<StateController>(StateController);
  });

  it('should call getSyncedState with object input', async () => {
    const data = { warehouseId: 5, state: 'ACTIVE' };
    await controller.getSyncedState(data);
    expect(inboundAdapter.getSyncedState).toHaveBeenCalledWith({ id: 5 });
  });

  it('should call getSyncedState with string input', async () => {
    const dataStr = JSON.stringify({ warehouseId:10, state: 'ACTIVE' });

    await controller.getSyncedState(dataStr);

    expect(inboundAdapter.getSyncedState).toHaveBeenCalledWith({ id: 10 });
  });

  it('should default to warehouseId 0 if malformed', async () => {
    const data = { foo: 'bar' };

    await controller.getSyncedState(data);

    expect(inboundAdapter.getSyncedState).toHaveBeenCalledWith({ id: 0 });
  });

  it('should handle invalid JSON string gracefully', async () => {
    const invalidStr = "{warehouseId:{id:1},state:'ACTIVE'}"; // invalid JSON

    const loggerSpy = jest.spyOn(controller['logger'], 'error').mockImplementation(() => {});

    await controller.getSyncedState(invalidStr);

    expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('Error parsing inbound JSON string'), expect.any(Error));
    expect(inboundAdapter.getSyncedState).toHaveBeenCalledWith({ id: 0 });
  });
});
