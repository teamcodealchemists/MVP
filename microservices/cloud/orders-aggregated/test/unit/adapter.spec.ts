import { CloudInboundPortsAdapter } from '../../src/infrastructure/adapters/cloudInboundPorts.adapter';
import { SyncOrderState } from '../../src/domain/syncOrderState.enum';
import { SyncOrderId } from '../../src/domain/syncOrderId.entity';
import { SyncSellOrder } from '../../src/domain/syncSellOrder.entity';
import { SyncInternalOrder } from '../../src/domain/syncInternalOrder.entity';

describe('CloudInboundPortsAdapter', () => {
  let adapter: CloudInboundPortsAdapter;
  let ordersService: any;
  let dataMapper: any;
  let cloudOrdersRepositoryMongo: any;

  beforeEach(() => {
    ordersService = {
      syncUpdateReservedStock: jest.fn(),
      syncCreateSellOrder: jest.fn(),
      syncCreateInternalOrder: jest.fn(),
      syncUpdateOrderState: jest.fn(),
      syncCancelOrder: jest.fn(),
    };
    dataMapper = {
      syncOrderIdToDomain: jest.fn().mockImplementation(dto => ({ id: dto.id })),
      syncOrderItemToDomain: jest.fn().mockImplementation(dto => dto),
      syncSellOrderToDomain: jest.fn().mockImplementation(dto => dto),
      syncInternalOrderToDomain: jest.fn().mockImplementation(dto => dto),
      syncOrderStateToDomain: jest.fn().mockImplementation(dto => dto.orderState),
      syncOrderStateToDTO: jest.fn().mockImplementation(state => ({ orderState: state })),
      syncInternalOrderToDTO: jest.fn().mockImplementation(order => order),
      syncSellOrderToDTO: jest.fn().mockImplementation(order => order),
      syncOrdersToDTO: jest.fn().mockImplementation(orders => orders),
    };
    cloudOrdersRepositoryMongo = {
      getState: jest.fn(),
      getById: jest.fn(),
      getAllFilteredOrders: jest.fn(),
      getAllOrders: jest.fn(),
    };

    adapter = new CloudInboundPortsAdapter(
      ordersService,
      dataMapper,
      cloudOrdersRepositoryMongo
    );
  });

  it('stockReserved chiama ordersService.syncUpdateReservedStock con i parametri giusti', async () => {
    const dto = {
        id: { id: 'O-1' },
        items: [
            { itemId: { id: 1 }, quantity: 10 }
        ]
    };
    await adapter.stockReserved(dto);
    expect(ordersService.syncUpdateReservedStock).toHaveBeenCalledWith({ id: 'O-1' }, dto.items);
  });

  it('syncAddSellOrder chiama ordersService.syncCreateSellOrder', async () => {
    const dto = {
        orderId: {id: 'O-2'},
        items: [],
        orderState: { orderState: 'CREATO' },
        creationDate: new Date('2024-01-01'),
        warehouseDeparture: 1,
        destinationAddress: 'Via Roma'
    };
    await adapter.syncAddSellOrder(dto);
    expect(ordersService.syncCreateSellOrder).toHaveBeenCalledWith(dto);
  });

  it('syncAddInternalOrder chiama ordersService.syncCreateInternalOrder', async () => {
    const dto = {
        orderId: {id: 'O-3'},
        items: [],
        orderState: { orderState: 'CREATO' },
        creationDate: new Date('2024-01-01'),
        warehouseDeparture: 2,
        warehouseDestination: 3,
        sellOrderReference: { id: 'O-2' }
    };
    await adapter.syncAddInternalOrder(dto);
    expect(ordersService.syncCreateInternalOrder).toHaveBeenCalledWith(dto);
  });

  it('updateOrderState chiama ordersService.syncUpdateOrderState', async () => {
    await adapter.updateOrderState('O-4', 'CONFERMATO');
    expect(ordersService.syncUpdateOrderState).toHaveBeenCalledWith({ id: 'O-4' }, 'CONFERMATO');
  });

  it('cancelOrder chiama ordersService.syncCancelOrder', async () => {
    await adapter.cancelOrder('O-5');
    expect(ordersService.syncCancelOrder).toHaveBeenCalledWith({ id: 'O-5' });
  });

  it('completeOrder chiama ordersService.syncUpdateOrderState con stato COMPLETED', async () => {
    await adapter.completeOrder('O-6');
    expect(ordersService.syncUpdateOrderState).toHaveBeenCalledWith({ id: 'O-6' }, SyncOrderState.COMPLETED);
  });

  it('getOrderState chiama repository e dataMapper', async () => {
    cloudOrdersRepositoryMongo.getState.mockResolvedValue('CONFERMATO');
    dataMapper.syncOrderStateToDTO.mockResolvedValue({ orderState: 'CONFERMATO' });
    const result = await adapter.getOrderState('O-7');
    expect(cloudOrdersRepositoryMongo.getState).toHaveBeenCalledWith({ id: 'O-7' });
    expect(result).toEqual({ orderState: 'CONFERMATO' });
  });

  it('getOrder chiama repository e dataMapper per InternalOrder', async () => {
    const orderId = new SyncOrderId('O-8');
    const sellOrderReference = new SyncOrderId('O-2');
    const internalOrder = new SyncInternalOrder(
        orderId,
        [],
        SyncOrderState.PENDING,
        new Date('2024-01-01'),
        1,
        2,
        sellOrderReference
    );
    cloudOrdersRepositoryMongo.getById.mockResolvedValue(internalOrder);
    dataMapper.syncInternalOrderToDTO.mockResolvedValue(internalOrder);
    const result = await adapter.getOrder('O-8');
    expect(cloudOrdersRepositoryMongo.getById).toHaveBeenCalledWith({ id: 'O-8' });
    expect(result).toEqual(internalOrder);
  });

  it('getOrder chiama repository e dataMapper per SellOrder', async () => {
    const orderId = new SyncOrderId('O-9');
    const sellOrder = new SyncSellOrder(
        orderId,
        [],
        SyncOrderState.PENDING,
        new Date('2024-01-01'),
        1,
        'Via Roma'
    );
    cloudOrdersRepositoryMongo.getById.mockResolvedValue(sellOrder);
    dataMapper.syncSellOrderToDTO.mockResolvedValue(sellOrder);
    const result = await adapter.getOrder('O-9');
    expect(cloudOrdersRepositoryMongo.getById).toHaveBeenCalledWith({ id: 'O-9' });
    expect(result).toEqual(sellOrder);
  });

  it('getOrder lancia errore se tipo non riconosciuto', async () => {
    cloudOrdersRepositoryMongo.getById.mockResolvedValue({});
    await expect(adapter.getOrder('O-10')).rejects.toThrow();
  });

  it('getAllFilteredOrders chiama repository e dataMapper', async () => {
    cloudOrdersRepositoryMongo.getAllFilteredOrders.mockResolvedValue({ sellOrders: [], internalOrders: [] });
    dataMapper.syncOrdersToDTO.mockResolvedValue({ sellOrders: [], internalOrders: [] });
    const result = await adapter.getAllFilteredOrders();
    expect(cloudOrdersRepositoryMongo.getAllFilteredOrders).toHaveBeenCalled();
    expect(result).toEqual({ sellOrders: [], internalOrders: [] });
  });

  it('getAllOrders chiama repository e dataMapper', async () => {
    cloudOrdersRepositoryMongo.getAllOrders.mockResolvedValue({ sellOrders: [], internalOrders: [] });
    dataMapper.syncOrdersToDTO.mockResolvedValue({ sellOrders: [], internalOrders: [] });
    const result = await adapter.getAllOrders();
    expect(cloudOrdersRepositoryMongo.getAllOrders).toHaveBeenCalled();
    expect(result).toEqual({ sellOrders: [], internalOrders: [] });
  });
});


import { CloudOutboundEventAdapter } from '../../src/infrastructure/adapters/cloudOutboundEvent.adapter';
import { SyncOrders } from '../../src/domain/syncOrders.entity';

describe('CloudOutboundEventAdapter', () => {
  let adapter: CloudOutboundEventAdapter;
  let natsService: any;
  let dataMapper: any;

  beforeEach(() => {
    natsService = { publish: jest.fn() };
    dataMapper = {};
    adapter = new CloudOutboundEventAdapter(natsService, dataMapper);
  });

  it('orderUpdated chiama natsService.publish con il topic corretto', async () => {
    const orderId = new SyncOrderId('O-1');
    const order = new SyncSellOrder(
        orderId,
        [],
        SyncOrderState.PENDING,
        new Date('2024-01-01'),
        1,
        'Via Roma'
    );
    await adapter.orderUpdated(order);
    expect(natsService.publish).toHaveBeenCalledWith('orders.updated', order);
  });

  it('publishAllProducts chiama natsService.publish con il topic corretto', async () => {
    const orders = new SyncOrders([], []);
    await adapter.publishAllProducts(orders);
    expect(natsService.publish).toHaveBeenCalledWith('get.warehouse.orders.publish.all', orders);
  });

  it('orderCancelled chiama natsService.publish con i topic corretti', async () => {
    const orderId = new SyncOrderId('O-2');
    await adapter.orderCancelled(orderId, 1);
    expect(natsService.publish).toHaveBeenCalledWith('call.aggregate.order.cancel', { orderId: 'O-2' });
    expect(natsService.publish).toHaveBeenCalledWith('call.order.O-2.cancel', { orderId: 'O-2' });
  });

  it('orderCompleted chiama natsService.publish con i topic corretti', async () => {
    const orderId = new SyncOrderId('O-3');
    await adapter.orderCompleted(orderId, 5);
    expect(natsService.publish).toHaveBeenCalledWith('call.aggregate.order.complete', { orderId: 'O-3' });
    expect(natsService.publish).toHaveBeenCalledWith('call.warehouse.5.order.O-3.complete', { orderId: 'O-3' });
  });
});