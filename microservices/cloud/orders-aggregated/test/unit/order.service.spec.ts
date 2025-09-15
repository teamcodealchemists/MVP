import { Test, TestingModule } from '@nestjs/testing';
import { CloudOrdersService } from '../../src/application/cloud.orders.service';
import { SyncOrderId } from '../../src/domain/syncOrderId.entity';
import { SyncOrderState } from '../../src/domain/syncOrderState.enum';
import { SyncSellOrder } from '../../src/domain/syncSellOrder.entity';
import { SyncInternalOrder } from '../../src/domain/syncInternalOrder.entity';
import { SyncOrderItem } from '../../src/domain/syncOrderItem.entity';
import { CloudOrdersRepositoryMongo } from '../../src/infrastructure/adapters/mongodb/cloud.orders.repository.impl';
import { CloudOutboundEventAdapter } from '../../src/infrastructure/adapters/cloudOutboundEvent.adapter';

describe('CloudOrdersService', () => {
  let service: CloudOrdersService;
  let repoMock: any;
  let eventAdapterMock: any;

  beforeEach(async () => {
    repoMock = {
      syncUpdateOrderState: jest.fn(),
      syncAddSellOrder: jest.fn(),
      syncAddInternalOrder: jest.fn(),
      syncRemoveById: jest.fn(),
      syncUpdateReservedStock: jest.fn(),
    };
    eventAdapterMock = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudOrdersService,
        { provide: 'CLOUDORDERSREPOSITORY', useValue: repoMock },
        { provide: CloudOutboundEventAdapter, useValue: eventAdapterMock },
      ],
    }).compile();

    service = module.get(CloudOrdersService);
  });

  it('syncUpdateOrderState chiama la repository con i parametri corretti', async () => {
    const id = new SyncOrderId('O-123');
    await service.syncUpdateOrderState(id, SyncOrderState.PROCESSING);
    expect(repoMock.syncUpdateOrderState).toHaveBeenCalledWith(id, SyncOrderState.PROCESSING);
  });

  it('syncCreateSellOrder chiama la repository con un nuovo oggetto', async () => {
    const order = {
      getOrderId: () => 'O-456',
      getItemsDetail: () => [],
      getOrderState: () => SyncOrderState.PENDING,
      getCreationDate: () => new Date(),
      getWarehouseDeparture: () => 'W-1',
      getDestinationAddress: () => 'Via Roma',
    } as unknown as SyncSellOrder;
    await service.syncCreateSellOrder(order);
    expect(repoMock.syncAddSellOrder).toHaveBeenCalled();
    // Puoi anche controllare che l'oggetto passato abbia l'id giusto:
    const calledOrder = repoMock.syncAddSellOrder.mock.calls[0][0];
    expect(calledOrder.getOrderId()).toBe('O-456');
  });

  it('syncCreateInternalOrder chiama la repository con un nuovo oggetto', async () => {
    const order = {
      getOrderId: () => 'O-789',
      getItemsDetail: () => [],
      getOrderState: () => SyncOrderState.PENDING,
      getCreationDate: () => new Date(),
      getWarehouseDeparture: () => 'W-2',
      getWarehouseDestination: () => 'W-3',
      getSellOrderReference: () => 'O-456',
    } as unknown as SyncInternalOrder;
    await service.syncCreateInternalOrder(order);
    expect(repoMock.syncAddInternalOrder).toHaveBeenCalled();
    const calledOrder = repoMock.syncAddInternalOrder.mock.calls[0][0];
    expect(calledOrder.getOrderId()).toBe('O-789');
  });

  it('syncCancelOrder chiama la repository e logga correttamente', async () => {
    const id = new SyncOrderId('O-999');
    repoMock.syncRemoveById.mockResolvedValue(true);
    await service.syncCancelOrder(id);
    expect(repoMock.syncRemoveById).toHaveBeenCalledWith(id);
  });

  it('syncCancelOrder logga errore se la repository restituisce false', async () => {
    const id = new SyncOrderId('O-998');
    repoMock.syncRemoveById.mockResolvedValue(false);
    await service.syncCancelOrder(id);
    expect(repoMock.syncRemoveById).toHaveBeenCalledWith(id);
  });

  it('syncUpdateReservedStock chiama la repository con i parametri corretti', async () => {
    const id = new SyncOrderId('O-777');
    const items: SyncOrderItem[] = [];
    await service.syncUpdateReservedStock(id, items);
    expect(repoMock.syncUpdateReservedStock).toHaveBeenCalledWith(id, items);
  });
});
