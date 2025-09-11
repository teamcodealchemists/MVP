import { RoutingEventAdapter } from '../../src/infrastructure/adapters/routing.event.adapter';
import { OutboundService } from '../../src/interfaces/outbound.service';
import { WarehouseAddress } from '../../src/domain/warehouseAddress.entity';
import { WarehouseState } from '../../src/domain/warehouseState.entity';
import { WarehouseId } from '../../src/domain/warehouseId.entity';

describe('RoutingEventAdapter', () => {
  it('deve chiamare outboundService.sendAddress con il DTO corretto', () => {
    const mockOutboundService = {
      sendAddress: jest.fn(),
    } as unknown as OutboundService;

    // Crea un WarehouseAddress di esempio
    const warehouseId = new WarehouseId(1);
    const warehouseState = new WarehouseState(warehouseId, 'ATTIVO');
    const warehouseAddress = new WarehouseAddress(warehouseState, 'Via Roma 1, Milano');

    const adapter = new RoutingEventAdapter(mockOutboundService);

    adapter.sendAddress(warehouseAddress);

    expect(mockOutboundService.sendAddress).toHaveBeenCalledWith(
      expect.objectContaining({
        "address": 'Via Roma 1, Milano',
        "warehouseState": {
          "state": 'ATTIVO',
          "warehouseId": { "warehouseId": 1 },
        },
      })
    );
  });
});

import { RoutingRepositoryMongo } from '../../src/infrastructure/adapters/mongodb/routing.repository.impl';

describe('RoutingRepositoryMongo', () => {
  let routingModel: any;
  let repository: RoutingRepositoryMongo;

  beforeEach(() => {
    routingModel = {
      create: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      deleteOne: jest.fn(),
      updateOne: jest.fn(),
      exec: jest.fn(),
    };
    repository = new RoutingRepositoryMongo(routingModel);
  });

  it('saveWarehouse chiama create con warehouseId', async () => {
    const id = new WarehouseId(1);
    await repository.saveWarehouse(id);
    expect(routingModel.create).toHaveBeenCalledWith({ warehouseId: 1 });
  });

  it('getWarehouseById ritorna WarehouseId se trovato', async () => {
    routingModel.findOne.mockReturnValue({ exec: () => Promise.resolve({ warehouseId: 2 }) });
    const result = await repository.getWarehouseById(new WarehouseId(2));
    expect(result).toEqual(new WarehouseId(2));
  });

  it('getWarehouseById ritorna null se non trovato', async () => {
    routingModel.findOne.mockReturnValue({ exec: () => Promise.resolve(null) });
    const result = await repository.getWarehouseById(new WarehouseId(99));
    expect(result).toBeNull();
  });

  it('getAllWarehouses ritorna array di WarehouseId', async () => {
    routingModel.find.mockReturnValue({ exec: () => Promise.resolve([{ warehouseId: 1 }, { warehouseId: 2 }]) });
    const result = await repository.getAllWarehouses();
    expect(result).toEqual([new WarehouseId(1), new WarehouseId(2)]);
  });

  it('saveWarehouseAddress chiama create con dati corretti', async () => {
    const id = new WarehouseId(3);
    const state = new WarehouseState(id, 'ATTIVO');
    const address = new WarehouseAddress(state, 'Via Roma 3');
    await repository.saveWarehouseAddress(address);
    expect(routingModel.create).toHaveBeenCalledWith({
      warehouseId: 3,
      state: 'ATTIVO',
      address: 'Via Roma 3',
    });
  });

  it('removeWarehouseAddress chiama deleteOne con warehouseId', async () => {
    routingModel.deleteOne.mockReturnValue({ exec: () => Promise.resolve() });
    const id = new WarehouseId(4);
    await repository.removeWarehouseAddress(id);
    expect(routingModel.deleteOne).toHaveBeenCalledWith({ warehouseId: 4 });
  });

  it('updateWarehouseAddress chiama updateOne con dati corretti', async () => {
    routingModel.updateOne.mockReturnValue({ exec: () => Promise.resolve() });
    const id = new WarehouseId(5);
    const state = new WarehouseState(id, 'ATTIVO');
    const address = new WarehouseAddress(state, 'Via Milano 5');
    await repository.updateWarehouseAddress(address);
    expect(routingModel.updateOne).toHaveBeenCalledWith(
      { warehouseId: 5 },
      { address: 'Via Milano 5' }
    );
  });

  it('getWarehouseAddressById ritorna WarehouseAddress se trovato', async () => {
    routingModel.findOne.mockReturnValue({
      exec: () => Promise.resolve({ warehouseId: 6, state: 'ATTIVO', address: 'Via Roma 6' }),
    });
    const result = await repository.getWarehouseAddressById(new WarehouseId(6));
    expect(result).toEqual(
      new WarehouseAddress(
        new WarehouseState(new WarehouseId(6), 'ATTIVO'),
        'Via Roma 6'
      )
    );
  });

  it('getWarehouseAddressById ritorna null se non trovato', async () => {
    routingModel.findOne.mockReturnValue({ exec: () => Promise.resolve(null) });
    const result = await repository.getWarehouseAddressById(new WarehouseId(99));
    expect(result).toBeNull();
  });

  it('getAllWarehouseAddresses ritorna array di WarehouseAddress', async () => {
    routingModel.find.mockReturnValue({
      exec: () => Promise.resolve([
        { warehouseId: 7, state: 'ATTIVO', address: 'Via Roma 7' },
        { warehouseId: 8, state: 'DISATTIVO', address: 'Via Milano 8' },
      ]),
    });
    const result = await repository.getAllWarehouseAddresses();
    expect(result).toEqual([
      new WarehouseAddress(
        new WarehouseState(new WarehouseId(7), 'ATTIVO'),
        'Via Roma 7'
      ),
      new WarehouseAddress(
        new WarehouseState(new WarehouseId(8), 'DISATTIVO'),
        'Via Milano 8'
      ),
    ]);
  });

  it('saveWarehouseState chiama create con dati corretti', async () => {
    const id = new WarehouseId(9);
    const state = new WarehouseState(id, 'ATTIVO');
    await repository.saveWarehouseState(state);
    expect(routingModel.create).toHaveBeenCalledWith({
      warehouseId: 9,
      state: 'ATTIVO',
    });
  });

  it('getWarehouseStateById ritorna WarehouseState se trovato', async () => {
    routingModel.findOne.mockReturnValue({
      exec: () => Promise.resolve({ warehouseId: 10, state: 'ATTIVO' }),
    });
    const result = await repository.getWarehouseStateById(new WarehouseId(10));
    expect(result).toEqual(
      new WarehouseState(new WarehouseId(10), 'ATTIVO')
    );
  });

  it('getWarehouseStateById ritorna null se non trovato', async () => {
    routingModel.findOne.mockReturnValue({ exec: () => Promise.resolve(null) });
    const result = await repository.getWarehouseStateById(new WarehouseId(99));
    expect(result).toBeNull();
  });

  it('getAllWarehouseStates ritorna array di WarehouseState', async () => {
    routingModel.find.mockReturnValue({
      exec: () => Promise.resolve([
        { warehouseId: 11, state: 'ATTIVO' },
        { warehouseId: 12, state: 'DISATTIVO' },
      ]),
    });
    const result = await repository.getAllWarehouseStates();
    expect(result).toEqual([
      new WarehouseState(new WarehouseId(11), 'ATTIVO'),
      new WarehouseState(new WarehouseId(12), 'DISATTIVO'),
    ]);
  });

  it('updateWarehouseState chiama updateOne con dati corretti', async () => {
    routingModel.updateOne.mockReturnValue({ exec: () => Promise.resolve() });
    const id = new WarehouseId(13);
    const state = new WarehouseState(id, 'DISATTIVO');
    await repository.updateWarehouseState(state);
    expect(routingModel.updateOne).toHaveBeenCalledWith(
      { warehouseId: 13 },
      { state: 'DISATTIVO' }
    );
  });
});