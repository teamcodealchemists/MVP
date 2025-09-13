import { CloudOrdersRepositoryMongo } from '../../src/infrastructure/adapters/mongodb/cloud.orders.repository.impl';
import { SyncOrderId } from '../../src/domain/syncOrderId.entity';
import { SyncOrderState } from '../../src/domain/syncOrderState.enum';
import { SyncInternalOrder } from '../../src/domain/syncInternalOrder.entity';
import { SyncSellOrder } from '../../src/domain/syncSellOrder.entity';
import { SyncOrders } from '../../src/domain/syncOrders.entity';
import { SyncOrderItem } from '../../src/domain/syncOrderItem.entity';
import { SyncItemId } from '../../src/domain/syncItemId.entity';

describe('CloudOrdersRepositoryMongo', () => {
  let repo: CloudOrdersRepositoryMongo;
  let syncInternalOrderModel: any;
  let syncSellOrderModel: any;
  let syncOrderItemDetailModel: any;
  let mapper: any;

  const makeLeanExec = (value: any) => ({
    lean: jest.fn(() => ({
      exec: jest.fn().mockResolvedValue(value),
    })),
  });

  beforeEach(() => {
    syncInternalOrderModel = {
      findOne: jest.fn(() => makeLeanExec(null)),
      find: jest.fn(() => makeLeanExec([])),
      findOneAndUpdate: jest.fn(() => makeLeanExec(null)),
      bulkWrite: jest.fn(),
      save: jest.fn(),
    };

    syncSellOrderModel = {
      findOne: jest.fn(() => makeLeanExec(null)),
      find: jest.fn(() => makeLeanExec([])),
      findOneAndUpdate: jest.fn(() => makeLeanExec(null)),
      bulkWrite: jest.fn(),
      save: jest.fn(),
    };

    syncOrderItemDetailModel = {};

    mapper = {
      syncInternalOrderToDomain: jest.fn(),
      syncSellOrderToDomain: jest.fn(),
    };

    repo = new CloudOrdersRepositoryMongo(
      syncInternalOrderModel,
      syncSellOrderModel,
      syncOrderItemDetailModel,
      mapper
    );
  });

  it('getById restituisce un InternalOrder se trovato', async () => {
    const id = new SyncOrderId('O-1');
    syncInternalOrderModel.findOne.mockReturnValueOnce(
      makeLeanExec({
        orderId: { id: 'O-1' },
        items: [],
        orderState: SyncOrderState.PENDING,
        creationDate: '2024-01-01',
        warehouseDeparture: 1,
        warehouseDestination: 2,
        sellOrderReference: { id: 'O-2' },
      })
    );
    const result = await repo.getById(id);
    expect(result).toBeInstanceOf(SyncInternalOrder);
    expect(syncInternalOrderModel.findOne).toHaveBeenCalledWith({ 'orderId.id': 'O-1' });
  });

  it('getById restituisce un SellOrder se InternalOrder non trovato', async () => {
    const id = new SyncOrderId('O-3');
    syncInternalOrderModel.findOne.mockReturnValueOnce(makeLeanExec(null));
    syncSellOrderModel.findOne.mockReturnValueOnce(
      makeLeanExec({
        orderId: { id: 'O-3' },
        items: [],
        orderState: SyncOrderState.PENDING,
        creationDate: '2024-01-01',
        warehouseDeparture: 1,
        destinationAddress: 'Via Roma',
      })
    );
    const result = await repo.getById(id);
    expect(result).toBeInstanceOf(SyncSellOrder);
    expect(syncSellOrderModel.findOne).toHaveBeenCalledWith({ 'orderId.id': 'O-3' });
  });

  it('getById lancia errore se nessun ordine trovato', async () => {
    const id = new SyncOrderId('O-404');
    syncInternalOrderModel.findOne.mockReturnValueOnce(makeLeanExec(null));
    syncSellOrderModel.findOne.mockReturnValueOnce(makeLeanExec(null));
    await expect(repo.getById(id)).rejects.toThrow('Ordine con ID O-404 non trovato');
  });

  it('getState restituisce lo stato di InternalOrder se trovato', async () => {
    const id = new SyncOrderId('O-1');
    syncInternalOrderModel.findOne.mockReturnValueOnce(makeLeanExec({ orderState: SyncOrderState.PENDING }));
    const result = await repo.getState(id);
    expect(result).toBe(SyncOrderState.PENDING);
  });

  it('getState restituisce lo stato di SellOrder se InternalOrder non trovato', async () => {
    const id = new SyncOrderId('O-2');
    syncInternalOrderModel.findOne.mockReturnValueOnce(makeLeanExec(null));
    syncSellOrderModel.findOne.mockReturnValueOnce(makeLeanExec({ orderState: SyncOrderState.PROCESSING }));
    const result = await repo.getState(id);
    expect(result).toBe(SyncOrderState.PROCESSING);
  });

  it('getState lancia errore se nessun ordine trovato', async () => {
    const id = new SyncOrderId('O-404');
    syncInternalOrderModel.findOne.mockReturnValueOnce(makeLeanExec(null));
    syncSellOrderModel.findOne.mockReturnValueOnce(makeLeanExec(null));
    await expect(repo.getState(id)).rejects.toThrow("Stato per l'ordine O-404 non trovato");
  });

  it('getAllFilteredOrders restituisce SyncOrders filtrati', async () => {
    syncInternalOrderModel.find.mockReturnValueOnce(makeLeanExec([
      {
        orderId: { id: 'O-1' },
        items: [],
        orderState: SyncOrderState.PENDING,
        creationDate: '2024-01-01',
        warehouseDeparture: 1,
        warehouseDestination: 2,
        sellOrderReference: { id: 'O-2' },
      },
    ]));
    syncSellOrderModel.find.mockReturnValueOnce(makeLeanExec([
      {
        orderId: { id: 'O-3' },
        items: [],
        orderState: SyncOrderState.PENDING,
        creationDate: '2024-01-01',
        warehouseDeparture: 1,
        destinationAddress: 'Via Roma',
      },
    ]));
    const result = await repo.getAllFilteredOrders();
    expect(result).toBeInstanceOf(SyncOrders);
    expect(result.getInternalOrders().length).toBe(1);
    expect(result.getSellOrders().length).toBe(1);
  });

  it('syncRemoveById ritorna false se già cancellato', async () => {
    const id = new SyncOrderId('O-7');
    repo.getState = jest.fn().mockResolvedValue(SyncOrderState.CANCELED);
    const result = await repo.syncRemoveById(id);
    expect(result).toBe(false);
  });

  it('syncRemoveById ritorna true se cancellazione riuscita', async () => {
    const id = new SyncOrderId('O-8');
    repo.getState = jest.fn().mockResolvedValue(SyncOrderState.PENDING);
    repo.syncUpdateOrderState = jest.fn().mockResolvedValue({
      getOrderState: () => SyncOrderState.CANCELED,
    });
    const result = await repo.syncRemoveById(id);
    expect(result).toBe(true);
  });

  it('syncUpdateOrderState aggiorna InternalOrder', async () => {
    const id = new SyncOrderId('O-9');
    syncInternalOrderModel.findOneAndUpdate.mockReturnValueOnce(makeLeanExec({
      orderId: { id: 'O-9' },
      items: [],
      orderState: SyncOrderState.PROCESSING,
      creationDate: '2024-01-01',
      warehouseDeparture: 1,
      warehouseDestination: 2,
      sellOrderReference: { id: 'O-2' },
    }));
    mapper.syncInternalOrderToDomain.mockResolvedValue(
      new SyncInternalOrder(id, [], SyncOrderState.PROCESSING, new Date('2024-01-01'), 1, 2, new SyncOrderId('O-2'))
    );
    const result = await repo.syncUpdateOrderState(id, SyncOrderState.PROCESSING);
    expect(result).toBeInstanceOf(SyncInternalOrder);
  });

  it('syncUpdateOrderState aggiorna SellOrder se InternalOrder non trovato', async () => {
    const id = new SyncOrderId('O-10');
    syncInternalOrderModel.findOneAndUpdate.mockReturnValueOnce(makeLeanExec(null));
    syncSellOrderModel.findOneAndUpdate.mockReturnValueOnce(makeLeanExec({
      orderId: { id: 'O-10' },
      items: [],
      orderState: SyncOrderState.PROCESSING,
      creationDate: '2024-01-01',
      warehouseDeparture: 1,
      destinationAddress: 'Via Roma',
    }));
    mapper.syncSellOrderToDomain.mockResolvedValue(
      new SyncSellOrder(id, [], SyncOrderState.PROCESSING, new Date('2024-01-01'), 1, 'Via Roma')
    );
    const result = await repo.syncUpdateOrderState(id, SyncOrderState.PROCESSING);
    expect(result).toBeInstanceOf(SyncSellOrder);
  });

  it('syncUpdateOrderState lancia errore se nessun ordine trovato', async () => {
    const id = new SyncOrderId('O-404');
    syncInternalOrderModel.findOneAndUpdate.mockReturnValueOnce(makeLeanExec(null));
    syncSellOrderModel.findOneAndUpdate.mockReturnValueOnce(makeLeanExec(null));
    await expect(repo.syncUpdateOrderState(id, SyncOrderState.PROCESSING)).rejects.toThrow();
  });

  it('syncUpdateReservedStock lancia errore se nessun ordine trovato', async () => {
    const id = new SyncOrderId('O-404');
    const items = [new SyncOrderItem(new SyncItemId(1), 5)];
    syncInternalOrderModel.findOne.mockReturnValueOnce(makeLeanExec(null));
    syncSellOrderModel.findOne.mockReturnValueOnce(makeLeanExec(null));
    await expect(repo.syncUpdateReservedStock(id, items)).rejects.toThrow();
  });

  it('syncUnreservedStock aggiorna tutti gli items di InternalOrder', async () => {
  const id = new SyncOrderId('O-12');
  // Mock InternalOrder trovato
  syncInternalOrderModel.findOne.mockReturnValueOnce(makeLeanExec({
    orderId: { id: 'O-12' },
    items: [
      { item: { itemId: { id: 1 }, quantity: 5 }, quantityReserved: 3, unitPrice: 10 }
    ],
    orderState: SyncOrderState.PENDING,
    creationDate: '2024-01-01',
    warehouseDeparture: 1,
    warehouseDestination: 2,
    sellOrderReference: { id: 'O-2' },
  }));
  syncInternalOrderModel.bulkWrite.mockResolvedValue({});
  // Mock documento aggiornato trovato
  syncInternalOrderModel.findOne.mockReturnValueOnce(makeLeanExec({
    orderId: { id: 'O-12' },
    items: [
      { item: { itemId: { id: 1 }, quantity: 5 }, quantityReserved: 0, unitPrice: 10 }
    ],
    orderState: SyncOrderState.PENDING,
    creationDate: '2024-01-01',
    warehouseDeparture: 1,
    warehouseDestination: 2,
    sellOrderReference: { id: 'O-2' },
  }));

  await expect(repo.syncUnreservedStock(id)).resolves.toBeUndefined();
  expect(syncInternalOrderModel.bulkWrite).toHaveBeenCalled();
});

it('syncUnreservedStock aggiorna tutti gli items di SellOrder', async () => {
  const id = new SyncOrderId('O-13');
  // InternalOrder non trovato, SellOrder trovato
  syncInternalOrderModel.findOne.mockReturnValueOnce(makeLeanExec(null));
  syncSellOrderModel.bulkWrite.mockResolvedValue({});
  syncSellOrderModel.findOne.mockReturnValueOnce(makeLeanExec({
    orderId: { id: 'O-13' },
    items: [
      { item: { itemId: { id: 1 }, quantity: 5 }, quantityReserved: 0, unitPrice: 10 }
    ],
    orderState: SyncOrderState.PENDING,
    creationDate: '2024-01-01',
    warehouseDeparture: 1,
    destinationAddress: 'Via Roma',
  }));

  await expect(repo.syncUnreservedStock(id)).resolves.toBeUndefined();
  expect(syncSellOrderModel.bulkWrite).toHaveBeenCalled();
});

it('syncUnreservedStock lancia errore se nessun documento trovato dopo bulkWrite', async () => {
  const id = new SyncOrderId('O-404');
  syncInternalOrderModel.findOne.mockReturnValueOnce(makeLeanExec(null));
  syncSellOrderModel.bulkWrite.mockResolvedValue({});
  syncSellOrderModel.findOne.mockReturnValueOnce(makeLeanExec(null));

  await expect(repo.syncUnreservedStock(id)).rejects.toThrow(`Impossibile trovare l'ordine con ID ${id.getId()}`);
});

it('syncUpdateReservedStock lancia errore se item non trovato', async () => {
  const id = new SyncOrderId('O-14');
  const items = [new SyncOrderItem(new SyncItemId(99), 5)];
  syncInternalOrderModel.findOne
    .mockReturnValueOnce(makeLeanExec({
      orderId: { id: 'O-14' },
      items: [
        { item: { itemId: { id: 1 }, quantity: 5 }, quantityReserved: 3, unitPrice: 10 }
      ],
      orderState: SyncOrderState.PENDING,
      creationDate: '2024-01-01',
      warehouseDeparture: 1,
      warehouseDestination: 2,
      sellOrderReference: { id: 'O-2' },
    }))
    .mockReturnValueOnce(makeLeanExec({
      orderId: { id: 'O-14' },
      items: [
        { item: { itemId: { id: 1 }, quantity: 5 }, quantityReserved: 3, unitPrice: 10 }
      ],
      orderState: SyncOrderState.PENDING,
      creationDate: '2024-01-01',
      warehouseDeparture: 1,
      warehouseDestination: 2,
      sellOrderReference: { id: 'O-2' },
    }));

  await expect(repo.syncUpdateReservedStock(id, items))
    .rejects.toThrow(`Impossibile trovare l'ordine con ID ${id.getId()}`);
});

it('syncUpdateReservedStock lancia errore se documento non trovato dopo bulkWrite', async () => {
  const id = new SyncOrderId('O-15');
  const items = [new SyncOrderItem(new SyncItemId(1), 5)];
  syncInternalOrderModel.findOne
    .mockReturnValueOnce(makeLeanExec({
      orderId: { id: 'O-15' },
      items: [
        { item: { itemId: { id: 1 }, quantity: 5 }, quantityReserved: 3, unitPrice: 10 }
      ],
      orderState: SyncOrderState.PENDING,
      creationDate: '2024-01-01',
      warehouseDeparture: 1,
      warehouseDestination: 2,
      sellOrderReference: { id: 'O-2' },
    }))
    .mockReturnValueOnce(makeLeanExec(null)); // documento non trovato dopo bulkWrite

  syncInternalOrderModel.bulkWrite.mockResolvedValue({});

  await expect(repo.syncUpdateReservedStock(id, items))
    .rejects.toThrow(`Impossibile trovare l'ordine con ID ${id.getId()}`);
});

});
