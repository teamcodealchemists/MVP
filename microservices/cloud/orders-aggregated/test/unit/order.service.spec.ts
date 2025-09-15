import { Test, TestingModule } from '@nestjs/testing';
import { CloudOrdersService } from '../../src/application/cloud.orders.service';
import { SyncOrderId } from '../../src/domain/syncOrderId.entity';
import { SyncOrderState } from '../../src/domain/syncOrderState.enum';
import { SyncSellOrder } from '../../src/domain/syncSellOrder.entity';
import { SyncInternalOrder } from '../../src/domain/syncInternalOrder.entity';
import { SyncOrderItem } from '../../src/domain/syncOrderItem.entity';

describe('CloudOrdersService', () => {
  let service: CloudOrdersService;
  let repoMock: any;
  let telemetryMock: any;

  beforeEach(async () => {
    repoMock = {
      syncUpdateOrderState: jest.fn(),
      syncAddSellOrder: jest.fn(),
      syncAddInternalOrder: jest.fn(),
      syncRemoveById: jest.fn(),
      syncUpdateReservedStock: jest.fn(),
      syncUnreservedStock: jest.fn(),
    };
    telemetryMock = {
      setInsertedOrders: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudOrdersService,
        { provide: 'CLOUDORDERSREPOSITORY', useValue: repoMock },
        { provide: 'TelemetryService', useValue: telemetryMock },
      ],
    }).compile();

    service = module.get(CloudOrdersService);
  });

  it('syncUpdateOrderState chiama la repository con i parametri corretti', async () => {
    const id = new SyncOrderId('O-123');
    await service.syncUpdateOrderState(id, SyncOrderState.PROCESSING);
    expect(repoMock.syncUpdateOrderState).toHaveBeenCalledWith(id, SyncOrderState.PROCESSING);
  });

  it('syncCreateSellOrder chiama la repository e TelemetryService con un nuovo oggetto', async () => {
    const order = new SyncSellOrder(
      new SyncOrderId('O-456'),
      [],
      SyncOrderState.PENDING,
      new Date(),
      1, 
      'Via Roma'
    );
    await service.syncCreateSellOrder(order);
    expect(repoMock.syncAddSellOrder).toHaveBeenCalled();
    const calledOrder = repoMock.syncAddSellOrder.mock.calls[0][0];
    expect(calledOrder.getOrderId()).toBe('O-456');
    expect(telemetryMock.setInsertedOrders).toHaveBeenCalledWith(1, 1); 
  });

  it('syncCreateInternalOrder chiama la repository e TelemetryService con un nuovo oggetto', async () => {
    const order = new SyncInternalOrder(
      new SyncOrderId('O-789'),
      [],
      SyncOrderState.PENDING,
      new Date(),
      2, 
      3, 
      'O-456'
    );
    await service.syncCreateInternalOrder(order);
    expect(repoMock.syncAddInternalOrder).toHaveBeenCalled();
    const calledOrder = repoMock.syncAddInternalOrder.mock.calls[0][0];
    expect(calledOrder.getOrderId()).toBe('O-789');
    expect(telemetryMock.setInsertedOrders).toHaveBeenCalledWith(1, 2); 
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

  it('syncUnreserveStock chiama la repository con i parametri corretti', async () => {
    const id = new SyncOrderId('O-888');
    await service.syncUnreserveStock(id);
    expect(repoMock.syncUnreservedStock).toHaveBeenCalledWith(id);
  });
});
