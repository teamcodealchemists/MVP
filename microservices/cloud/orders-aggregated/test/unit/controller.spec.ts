import { AccessController } from '../../src/interfaces/access.controller';

describe('AccessController', () => {
  let controller: AccessController;

  beforeEach(() => {
    controller = new AccessController();
    process.env.WAREHOUSE_ID = '1';
  });

  it('should grant access for global token', async () => {
    const payload = { token: { isGlobal: true, error: undefined } };
    const result = await controller.invAccess(payload);
    expect(JSON.parse(result)).toEqual({ result: { get: true, call: "*" } });
  });

  it('should grant access for assigned warehouse', async () => {
    const payload = { token: { isGlobal: false, error: undefined, warehouseAssigned: [{ warehouseId: 1 }] } };
    const result = await controller.invAccess(payload);
    expect(JSON.parse(result)).toEqual({ result: { get: true, call: "*" } });
  });

  it('should deny access for not assigned warehouse', async () => {
    const payload = { token: { isGlobal: false, error: undefined, warehouseAssigned: [{ warehouseId: 2 }] } };
    const result = await controller.invAccess(payload);
    expect(JSON.parse(result)).toEqual({ result: { get: false } });
  });

  it('should deny access if token has error', async () => {
    const payload = { token: { isGlobal: false, error: 'Invalid token' } };
    const result = await controller.invAccess(payload);
    expect(JSON.parse(result)).toEqual({ error: { code: 'system.accessDenied', message: 'Invalid token' } });
  });

  it('should deny access if token is missing', async () => {
    const payload = {};
    const result = await controller.invAccess(payload);
    expect(JSON.parse(result)).toEqual({ error: { code: 'system.accessDenied', message: 'Operation not allowed.' } });
  });
});


import { CloudOrdersController } from '../../src/interfaces/cloudOrders.controller';

describe('CloudOrdersController', () => {
  let controller: CloudOrdersController;
  let inboundPortsAdapter: any;

  beforeEach(() => {
    inboundPortsAdapter = {
      stockReserved: jest.fn(),
      syncAddSellOrder: jest.fn(),
      syncAddInternalOrder: jest.fn(),
      updateOrderState: jest.fn(),
      cancelOrder: jest.fn(),
      completeOrder: jest.fn(),
      getOrderState: jest.fn(),
      getOrder: jest.fn(),
      getAllFilteredOrders: jest.fn(),
      getAllOrders: jest.fn(),
    };
    controller = new CloudOrdersController(inboundPortsAdapter);
  });

  it('should call stockReserved', async () => {
    const payload = {
      orderIdDTO: { id: 'O-1' },
      itemsDTO: []
    };
    await controller.stockReserved(payload);
    expect(inboundPortsAdapter.stockReserved).toHaveBeenCalledWith(expect.any(Object));
  });

  it('should call syncAddSellOrder', async () => {
    const payload = { orderId: 'O-2', items: [], orderState: 'CREATO', creationDate: '2024-01-01', warehouseDeparture: 'W-1', destinationAddress: 'Via Roma' };
    await controller.syncAddSellOrder(payload);
    expect(inboundPortsAdapter.syncAddSellOrder).toHaveBeenCalledWith(expect.objectContaining(payload));
  });

  it('should call syncAddInternalOrder', async () => {
    const payload = { orderId: 'O-3', items: [], orderState: 'CREATO', creationDate: '2024-01-01', warehouseDeparture: 'W-2', warehouseDestination: 'W-3', sellOrderReference: 'O-2' };
    await controller.syncAddInternalOrder(payload);
    expect(inboundPortsAdapter.syncAddInternalOrder).toHaveBeenCalledWith(expect.objectContaining(payload));
  });

  it('should call updateOrderState', async () => {
    const mockContext = { getSubject: () => 'event.aggregate.order.O-4.state.update.CREATO' };
    await controller.updateOrderState(mockContext);
    expect(inboundPortsAdapter.updateOrderState).toHaveBeenCalledWith('O-4', 'CREATO');
  });

  it('should call cancelOrder', async () => {
    const mockContext = { getSubject: () => 'event.aggregate.order.O-5.cancel' };
    await controller.cancelOrder(mockContext);
    expect(inboundPortsAdapter.cancelOrder).toHaveBeenCalledWith('O-5');
  });

  it('should call completeOrder', async () => {
    const mockContext = { getSubject: () => 'event.aggregate.order.O-6.complete' };
    await controller.completeOrder(mockContext);
    expect(inboundPortsAdapter.completeOrder).toHaveBeenCalledWith('O-6');
  });

  it('should call getOrderState and return value', async () => {
    inboundPortsAdapter.getOrderState.mockResolvedValue({ orderState: 'CREATO' });
    const mockContext = { getSubject: () => 'get.aggregate.order.O-7.state' };
    const result = await controller.getOrderState(mockContext);
    expect(inboundPortsAdapter.getOrderState).toHaveBeenCalledWith('O-7');
    expect(result).toEqual({ orderState: 'CREATO' });
  });

  it('should call getOrder and return JSON', async () => {
    inboundPortsAdapter.getOrder.mockResolvedValue({
      orderId: { id: 'O-8' },
      orderState: { orderState: 'CREATO' },
      creationDate: '2024-01-01',
      warehouseDeparture: 'W-1',
      destinationAddress: 'Via Roma'
    });
    const mockContext = { getSubject: () => 'get.aggregate.order.O-8' };
    const result = await controller.getOrder(mockContext);
    const parsed = JSON.parse(result);
    expect(parsed.result.model.orderId).toBe('O-8');
    expect(parsed.result.model.orderState).toBe('CREATO');
  });

  it('should call getAllFilteredOrders and return collection', async () => {
    inboundPortsAdapter.getAllFilteredOrders.mockResolvedValue({
      internalOrders: [{ orderId: { id: 'O-9' } }],
      sellOrders: [{ orderId: { id: 'O-10' } }]
    });
    const result = await controller.getAllFilteredOrders();
    const parsed = JSON.parse(result);
    expect(parsed.result.collection).toEqual([
      { rid: 'aggregate.order.O-9' },
      { rid: 'aggregate.order.O-10' }
    ]);
  });

  it('should call getAllOrders and return collection', async () => {
    inboundPortsAdapter.getAllOrders.mockResolvedValue({
      internalOrders: [{ orderId: { id: 'O-11' } }],
      sellOrders: [{ orderId: { id: 'O-12' } }]
    });
    const result = await controller.getAllOrders();
    const parsed = JSON.parse(result);
    expect(parsed.result.collection).toEqual([
      { rid: 'aggregate.order.O-11' },
      { rid: 'aggregate.order.O-12' }
    ]);
  });

    it('should call getAllOrdersForCentralized and return collection', async () => {
    inboundPortsAdapter.getAllOrders.mockResolvedValue({
        internalOrders: [{ orderId: { id: 'O-13' } }],
        sellOrders: [{ orderId: { id: 'O-14' } }]
    });
    const result = await controller.getAllOrdersForCentralized();
    if (result) {
        const parsed = JSON.parse(result);
        expect(parsed.result.collection).toEqual([
        { orderId: { id: 'O-13' } },
        { orderId: { id: 'O-14' } }
        ]);
    } else {
        fail('result should not be null');
    }
    });

  it('should return null if getAllOrdersForCentralized returns empty', async () => {
    inboundPortsAdapter.getAllOrders.mockResolvedValue({
      internalOrders: [],
      sellOrders: []
    });
    const result = await controller.getAllOrdersForCentralized();
    expect(result).toBeNull();
  });
});