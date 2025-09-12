import { OrderSaga } from '../../src/interfaces/nats/order.saga';
import { OrdersRepositoryMongo } from '../../src/infrastructure/adapters/mongodb/orders.repository.impl';
import { OutboundEventAdapter } from '../../src/infrastructure/adapters/outboundEvent.adapter';
import { OrderId } from '../../src/domain/orderId.entity';
import { SellOrder } from '../../src/domain/sellOrder.entity';
import { InternalOrder } from '../../src/domain/internalOrder.entity';

describe('OrderSaga', () => {
  let saga: OrderSaga;
  let ordersRepositoryMongo: jest.Mocked<OrdersRepositoryMongo>;
  let outboundEventAdapter: jest.Mocked<OutboundEventAdapter>;

  beforeEach(() => {
    ordersRepositoryMongo = {
      getById: jest.fn(),
    } as any;

    outboundEventAdapter = {
      publishReserveStock: jest.fn(),
    } as any;

    saga = new OrderSaga(ordersRepositoryMongo, outboundEventAdapter);
  });

  it('startSellOrderSaga chiama publishReserveStock con items corretti', async () => {
    const orderId = new OrderId('S123');
    const mockItem = { id: 1 };
    const mockItemDetail = { getItem: jest.fn().mockReturnValue(mockItem) };

    // Mock SellOrder con tutte le proprietà minime richieste
    const mockSellOrder = Object.create(SellOrder.prototype);
    mockSellOrder.getItemsDetail = jest.fn().mockReturnValue([mockItemDetail, mockItemDetail]);
    mockSellOrder.getOrderId = jest.fn().mockReturnValue(orderId);
    mockSellOrder.destinationAddress = 'Via Roma';

    ordersRepositoryMongo.getById.mockResolvedValue(mockSellOrder);

    await saga.startSellOrderSaga(orderId);

    expect(ordersRepositoryMongo.getById).toHaveBeenCalledWith(orderId);
    expect(mockSellOrder.getItemsDetail).toHaveBeenCalled();
    expect(outboundEventAdapter.publishReserveStock).toHaveBeenCalledWith(orderId, [mockItem, mockItem]);
  });

  it('startInternalOrderSaga chiama publishReserveStock con items corretti', async () => {
    const orderId = new OrderId('I123');
    const mockItem = { id: 2 };
    const mockItemDetail = { getItem: jest.fn().mockReturnValue(mockItem) };

    // Mock InternalOrder con tutte le proprietà minime richieste
    const mockInternalOrder = Object.create(InternalOrder.prototype);
    mockInternalOrder.getItemsDetail = jest.fn().mockReturnValue([mockItemDetail]);
    mockInternalOrder.getOrderId = jest.fn().mockReturnValue(orderId);
    mockInternalOrder.warehouseDestination = 2;

    ordersRepositoryMongo.getById.mockResolvedValue(mockInternalOrder);

    await saga.startInternalOrderSaga(orderId);

    expect(ordersRepositoryMongo.getById).toHaveBeenCalledWith(orderId);
    expect(mockInternalOrder.getItemsDetail).toHaveBeenCalled();
    expect(outboundEventAdapter.publishReserveStock).toHaveBeenCalledWith(orderId, [mockItem]);
  });

  it('gestisce errori da ordersRepositoryMongo.getById', async () => {
    const orderId = new OrderId('ERR');
    ordersRepositoryMongo.getById.mockRejectedValue(new Error('not found'));

    await expect(saga.startSellOrderSaga(orderId)).rejects.toThrow('not found');
    await expect(saga.startInternalOrderSaga(orderId)).rejects.toThrow('not found');
  });

  it('gestisce errori da outboundEventAdapter.publishReserveStock', async () => {
    const orderId = new OrderId('S123');
    const mockItem = { id: 1 };
    const mockItemDetail = { getItem: jest.fn().mockReturnValue(mockItem) };
    const mockSellOrder = Object.create(SellOrder.prototype);
    mockSellOrder.getItemsDetail = jest.fn().mockReturnValue([mockItemDetail]);
    mockSellOrder.getOrderId = jest.fn().mockReturnValue(orderId);
    mockSellOrder.destinationAddress = 'Via Roma';

    ordersRepositoryMongo.getById.mockResolvedValue(mockSellOrder);
    outboundEventAdapter.publishReserveStock.mockRejectedValue(new Error('publish error'));

    await expect(saga.startSellOrderSaga(orderId)).rejects.toThrow('publish error');
    await expect(saga.startInternalOrderSaga(orderId)).rejects.toThrow('publish error');
  });
});