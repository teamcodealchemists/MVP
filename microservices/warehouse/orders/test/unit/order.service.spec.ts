import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { OrdersService } from 'src/application/orders.service';
import { OrdersRepositoryMongo } from 'src/infrastructure/adapters/mongodb/orders.repository.impl';
import { OutboundEventAdapter } from 'src/infrastructure/adapters/outboundEvent.adapter';
import { OrderSaga } from 'src/interfaces/nats/order.saga';
import { Orders } from 'src/domain/orders.entity';
import { OrderItem } from 'src/domain/orderItem.entity';
import { OrderItemDetail } from 'src/domain/orderItemDetail.entity';
import { OrderState } from 'src/domain/orderState.enum';
import { OrderId } from 'src/domain/orderId.entity';
import { InternalOrder } from 'src/domain/internalOrder.entity';
import { SellOrder } from 'src/domain/sellOrder.entity';
import { ItemId } from 'src/domain/itemId.entity';
import { RpcException } from '@nestjs/microservices';

// Mock dei dependencies
jest.mock('src/infrastructure/adapters/mongodb/orders.repository.impl');
jest.mock('src/infrastructure/adapters/outboundEvent.adapter');
jest.mock('src/interfaces/nats/order.saga');

describe('OrdersService', () => {
  let service: OrdersService;
  let ordersRepositoryMongo: jest.Mocked<OrdersRepositoryMongo>;
  let outboundEventAdapter: jest.Mocked<OutboundEventAdapter>;
  let orderSaga: jest.Mocked<OrderSaga>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: 'ORDERSREPOSITORY',
          useValue: {
            getById: jest.fn(),
            getState: jest.fn(),
            updateReservedStock: jest.fn(),
            updateOrderState: jest.fn(),
            genUniqueId: jest.fn(),
            addSellOrder: jest.fn(),
            addInternalOrder: jest.fn(),
            checkReservedQuantityForSellOrder: jest.fn(),
            checkReservedQuantityForInternalOrder: jest.fn(),
          },
        },
        {
          provide: OutboundEventAdapter,
          useValue: {
            publishUpdatedReservedStock: jest.fn(),
            orderStateUpdated: jest.fn(),
            publishSellOrder: jest.fn(),
            publishInternalOrder: jest.fn(),
            waitingForStock: jest.fn(),
            unreserveStock: jest.fn(),
            publishShipment: jest.fn(),
            publishStockRepl: jest.fn(),
            receiveShipment: jest.fn(),
            orderCompleted: jest.fn(),
            publishReserveStock: jest.fn(),
          },
        },
        {
          provide: OrderSaga,
          useValue: {
            startSellOrderSaga: jest.fn(),
            startInternalOrderSaga: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    ordersRepositoryMongo = module.get('ORDERSREPOSITORY');
    outboundEventAdapter = module.get(OutboundEventAdapter);
    orderSaga = module.get(OrderSaga);

    // Mock process.env
    process.env.WAREHOUSE_ID = '1';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkOrderExistence', () => {
    it('should return true if order exists', async () => {
      ordersRepositoryMongo.getById.mockResolvedValue({} as any);
      
      const result = await service.checkOrderExistence(new OrderId('I123'));
      expect(result).toBe(true);
    });

    it('should return false if order does not exist', async () => {
      ordersRepositoryMongo.getById.mockRejectedValue(new Error('Not found'));
      
      const result = await service.checkOrderExistence(new OrderId('I999'));
      expect(result).toBe(false);
    });
  });

  describe('updateReservedStock', () => {
    it('should update reserved stock for SellOrder', async () => {
      const orderId = new OrderId('S123');
      const items = [new OrderItem(new ItemId(1), 2)];
      
      const sellOrder = new SellOrder(
        orderId,
        [new OrderItemDetail(new OrderItem(new ItemId(1), 5), 3, 10)],
        OrderState.PROCESSING,
        new Date(),
        1,
        'Via Roma'
      );

      ordersRepositoryMongo.getById.mockResolvedValue(sellOrder);
      ordersRepositoryMongo.updateReservedStock.mockResolvedValue(sellOrder);
      ordersRepositoryMongo.checkReservedQuantityForSellOrder.mockResolvedValue();

      await service.updateReservedStock(orderId, items);

      expect(ordersRepositoryMongo.updateReservedStock).toHaveBeenCalled();
      expect(outboundEventAdapter.publishUpdatedReservedStock).toHaveBeenCalled();
    });

    it('should update reserved stock for InternalOrder', async () => {
      const orderId = new OrderId('I123');
      const items = [new OrderItem(new ItemId(1), 2)];
      
      const internalOrder = new InternalOrder(
        orderId,
        [new OrderItemDetail(new OrderItem(new ItemId(1), 5), 3, 10)],
        OrderState.PROCESSING,
        new Date(),
        1,
        2,
        new OrderId('S456')
      );

      ordersRepositoryMongo.getById.mockResolvedValue(internalOrder);
      ordersRepositoryMongo.updateReservedStock.mockResolvedValue(internalOrder);
      ordersRepositoryMongo.checkReservedQuantityForInternalOrder.mockResolvedValue();

      await service.updateReservedStock(orderId, items);

      expect(ordersRepositoryMongo.updateReservedStock).toHaveBeenCalled();
      expect(outboundEventAdapter.publishUpdatedReservedStock).toHaveBeenCalled();
    });

    it('should handle errors during update', async () => {
      ordersRepositoryMongo.getById.mockRejectedValue(new Error('DB error'));
      
      await expect(service.updateReservedStock(new OrderId('I123'), []))
        .rejects.toThrow('DB error');
    });
  });

  describe('updateFullReservedStock', () => {
    it('should update full reserved stock for SellOrder', async () => {
      const orderId = new OrderId('S123');
      const sellOrder = new SellOrder(
        orderId,
        [new OrderItemDetail(new OrderItem(new ItemId(1), 5), 0, 10)],
        OrderState.PROCESSING,
        new Date(),
        1,
        'Via Roma'
      );

      ordersRepositoryMongo.getById.mockResolvedValue(sellOrder);
      ordersRepositoryMongo.updateReservedStock.mockResolvedValue(sellOrder);
      ordersRepositoryMongo.checkReservedQuantityForSellOrder.mockResolvedValue();

      await service.updateFullReservedStock(orderId);

      expect(ordersRepositoryMongo.updateReservedStock).toHaveBeenCalled();
    });

    it('should update full reserved stock for InternalOrder', async () => {
      const orderId = new OrderId('I123');
      const internalOrder = new InternalOrder(
        orderId,
        [new OrderItemDetail(new OrderItem(new ItemId(1), 5), 0, 10)],
        OrderState.PROCESSING,
        new Date(),
        1,
        2,
        new OrderId('S456')
      );

      ordersRepositoryMongo.getById.mockResolvedValue(internalOrder);
      ordersRepositoryMongo.updateReservedStock.mockResolvedValue(internalOrder);
      ordersRepositoryMongo.checkReservedQuantityForInternalOrder.mockResolvedValue();

      await service.updateFullReservedStock(orderId);

      expect(ordersRepositoryMongo.updateReservedStock).toHaveBeenCalled();
    });
  });

  describe('updateOrderState', () => {
    it('should update order state successfully', async () => {
      const orderId = new OrderId('I123');
      const internalOrder = new InternalOrder(
        orderId,
        [],
        OrderState.PENDING,
        new Date(),
        1,
        2,
        new OrderId('S456')
      );

      ordersRepositoryMongo.getState.mockResolvedValue(OrderState.PENDING);
      ordersRepositoryMongo.updateOrderState.mockResolvedValue(internalOrder);
      ordersRepositoryMongo.getById.mockResolvedValue(internalOrder);

      await service.updateOrderState(orderId, OrderState.PROCESSING);

      expect(ordersRepositoryMongo.updateOrderState).toHaveBeenCalled();
      expect(outboundEventAdapter.orderStateUpdated).toHaveBeenCalled();
    });

    it('should throw error for invalid state transition', async () => {
      ordersRepositoryMongo.getState.mockResolvedValue(OrderState.COMPLETED);

      await expect(service.updateOrderState(new OrderId('I123'), OrderState.PROCESSING))
        .rejects.toThrow('Impossibile violare il corretto flusso');
    });

    it('should not publish event if not departure warehouse', async () => {
      process.env.WAREHOUSE_ID = '2'; // Different warehouse
      
      const orderId = new OrderId('I123');
      const internalOrder = new InternalOrder(
        orderId,
        [],
        OrderState.PENDING,
        new Date(),
        1, // warehouseDeparture = 1
        2,
        new OrderId('S456')
      );

      ordersRepositoryMongo.getState.mockResolvedValue(OrderState.PENDING);
      ordersRepositoryMongo.updateOrderState.mockResolvedValue(internalOrder);
      ordersRepositoryMongo.getById.mockResolvedValue(internalOrder);

      await service.updateOrderState(orderId, OrderState.PROCESSING);

      expect(outboundEventAdapter.orderStateUpdated).not.toHaveBeenCalled();
    });
  });

  describe('createSellOrder', () => {
    it('should create sell order with new ID', async () => {
      const sellOrder = new SellOrder(
        new OrderId(''),
        [],
        OrderState.PENDING,
        new Date(),
        1,
        'Via Roma'
      );

      const newOrderId = new OrderId('S123');
      ordersRepositoryMongo.genUniqueId.mockResolvedValue(newOrderId);
      ordersRepositoryMongo.addSellOrder.mockResolvedValue();
      orderSaga.startSellOrderSaga.mockResolvedValue();
      outboundEventAdapter.publishSellOrder.mockResolvedValue('success');

      const result = await service.createSellOrder(sellOrder);

      expect(result).toBe('S123');
      expect(ordersRepositoryMongo.addSellOrder).toHaveBeenCalled();
      expect(orderSaga.startSellOrderSaga).toHaveBeenCalled();
    });

    it('should create sell order with existing ID', async () => {
      const sellOrder = new SellOrder(
        new OrderId('S123'),
        [],
        OrderState.PENDING,
        new Date(),
        1,
        'Via Roma'
      );

      ordersRepositoryMongo.addSellOrder.mockResolvedValue();
      orderSaga.startSellOrderSaga.mockResolvedValue();
      outboundEventAdapter.publishSellOrder.mockResolvedValue('success');

      const result = await service.createSellOrder(sellOrder);

      expect(result).toBe('S123');
      expect(ordersRepositoryMongo.genUniqueId).not.toHaveBeenCalled();
      expect(outboundEventAdapter.publishSellOrder).toHaveBeenCalled();
    });
  });

  describe('createInternalOrder', () => {
    it('should create internal order in departure warehouse', async () => {
      const internalOrder = new InternalOrder(
        new OrderId(''),
        [],
        OrderState.PENDING,
        new Date(),
        1, // warehouseDeparture matches WAREHOUSE_ID
        2,
        new OrderId('S456')
      );

      const newOrderId = new OrderId('I123');
      ordersRepositoryMongo.genUniqueId.mockResolvedValue(newOrderId);
      ordersRepositoryMongo.addInternalOrder.mockResolvedValue();
      outboundEventAdapter.publishInternalOrder.mockResolvedValue();
      orderSaga.startInternalOrderSaga.mockResolvedValue();

      const result = await service.createInternalOrder(internalOrder);

      expect(result).toBe('I123');
      expect(outboundEventAdapter.publishInternalOrder).toHaveBeenCalled();
      expect(orderSaga.startInternalOrderSaga).toHaveBeenCalled();
    });

    it('should create internal order in destination warehouse', async () => {
      const internalOrder = new InternalOrder(
        new OrderId(''),
        [],
        OrderState.PENDING,
        new Date(),
        2, // warehouseDeparture different from WAREHOUSE_ID
        1,
        new OrderId('S456')
      );

      const newOrderId = new OrderId('I123');
      ordersRepositoryMongo.genUniqueId.mockResolvedValue(newOrderId);
      ordersRepositoryMongo.addInternalOrder.mockResolvedValue();
      outboundEventAdapter.waitingForStock.mockResolvedValue();

      const result = await service.createInternalOrder(internalOrder);

      expect(result).toBe('I123');
      expect(outboundEventAdapter.publishInternalOrder).not.toHaveBeenCalled();
      expect(outboundEventAdapter.waitingForStock).toHaveBeenCalled();
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order and unreserve stock', async () => {
      const orderId = new OrderId('I123');
      const internalOrder = new InternalOrder(
        orderId,
        [new OrderItemDetail(new OrderItem(new ItemId(1), 5), 3, 10)],
        OrderState.PENDING,
        new Date(),
        1,
        2,
        new OrderId('S456')
      );

      jest.spyOn(service, 'updateOrderState').mockResolvedValue();
      ordersRepositoryMongo.getById.mockResolvedValue(internalOrder);

      await service.cancelOrder(orderId);

      expect(service.updateOrderState).toHaveBeenCalledWith(orderId, OrderState.CANCELED);
      expect(outboundEventAdapter.unreserveStock).toHaveBeenCalled();
    });
  });

  describe('stockReserved', () => {
    it('should handle stock reserved for SellOrder', async () => {
      const orderId = new OrderId('S123');
      const items = [new OrderItem(new ItemId(1), 2)];
      
      const sellOrder = new SellOrder(
        orderId,
        [new OrderItemDetail(new OrderItem(new ItemId(1), 5), 3, 10)],
        OrderState.PROCESSING,
        new Date(),
        1,
        'Via Roma'
      );

      ordersRepositoryMongo.getById.mockResolvedValue(sellOrder);
      ordersRepositoryMongo.updateReservedStock.mockResolvedValue(sellOrder);
      ordersRepositoryMongo.checkReservedQuantityForSellOrder.mockResolvedValue();

      await service.stockReserved(orderId, items);

      expect(ordersRepositoryMongo.updateReservedStock).toHaveBeenCalled();
    });
  });

  describe('checkReservedQuantityForSellOrder', () => {
    it('should publish shipment when fully reserved', async () => {
      const sellOrder = new SellOrder(
        new OrderId('S123'),
        [new OrderItemDetail(new OrderItem(new ItemId(1), 5), 5, 10)],
        OrderState.PROCESSING,
        new Date(),
        1,
        'Via Roma'
      );

      ordersRepositoryMongo.checkReservedQuantityForSellOrder.mockResolvedValue();

      await service.checkReservedQuantityForSellOrder(sellOrder);

      expect(outboundEventAdapter.publishShipment).toHaveBeenCalled();
    });

    it('should publish stock replenishment when not fully reserved', async () => {
      const sellOrder = new SellOrder(
        new OrderId('S123'),
        [new OrderItemDetail(new OrderItem(new ItemId(1), 5), 3, 10)],
        OrderState.PROCESSING,
        new Date(),
        1,
        'Via Roma'
      );

      ordersRepositoryMongo.checkReservedQuantityForSellOrder.mockRejectedValue(
        new Error('Quantità riservata insufficiente')
      );

      await service.checkReservedQuantityForSellOrder(sellOrder);

      expect(outboundEventAdapter.publishStockRepl).toHaveBeenCalled();
    });
  });

  describe('checkReservedQuantityForInternalOrder', () => {
    it('should publish internal order when fully reserved', async () => {
      const internalOrder = new InternalOrder(
        new OrderId('I123'),
        [new OrderItemDetail(new OrderItem(new ItemId(1), 5), 5, 10)],
        OrderState.PROCESSING,
        new Date(),
        1,
        2,
        new OrderId('S456')
      );

      ordersRepositoryMongo.checkReservedQuantityForInternalOrder.mockResolvedValue();

      await service.checkReservedQuantityForInternalOrder(internalOrder);

      expect(outboundEventAdapter.publishInternalOrder).toHaveBeenCalled();
    });

    it('should cancel order when not fully reserved', async () => {
      const internalOrder = new InternalOrder(
        new OrderId('I123'),
        [new OrderItemDetail(new OrderItem(new ItemId(1), 5), 3, 10)],
        OrderState.PROCESSING,
        new Date(),
        1,
        2,
        new OrderId('S456')
      );

      ordersRepositoryMongo.checkReservedQuantityForInternalOrder.mockRejectedValue(
        new Error('Quantità riservata insufficiente')
      );
      jest.spyOn(service, 'cancelOrder').mockResolvedValue();

      await service.checkReservedQuantityForInternalOrder(internalOrder);

      expect(service.cancelOrder).toHaveBeenCalled();
    });
  });

  describe('shipOrder', () => {
    it('should ship SellOrder', async () => {
      const orderId = new OrderId('S123');
      const sellOrder = new SellOrder(
        orderId,
        [new OrderItemDetail(new OrderItem(new ItemId(1), 5), 5, 10)],
        OrderState.PROCESSING,
        new Date(),
        1,
        'Via Roma'
      );

      ordersRepositoryMongo.getById.mockResolvedValue(sellOrder);
      ordersRepositoryMongo.updateOrderState.mockResolvedValue(sellOrder);

      await service.shipOrder(orderId);

      expect(ordersRepositoryMongo.updateOrderState).toHaveBeenCalledWith(orderId, OrderState.SHIPPED);
      expect(outboundEventAdapter.publishShipment).toHaveBeenCalled();
    });

    it('should ship InternalOrder', async () => {
      const orderId = new OrderId('I123');
      const internalOrder = new InternalOrder(
        orderId,
        [new OrderItemDetail(new OrderItem(new ItemId(1), 5), 5, 10)],
        OrderState.PROCESSING,
        new Date(),
        1,
        2,
        new OrderId('S456')
      );

      ordersRepositoryMongo.getById.mockResolvedValue(internalOrder);
      ordersRepositoryMongo.updateOrderState.mockResolvedValue(internalOrder);

      await service.shipOrder(orderId);

      expect(outboundEventAdapter.orderStateUpdated).toHaveBeenCalled();
    });
  });

  describe('receiveOrder', () => {
    it('should receive InternalOrder shipment', async () => {
      const orderId = new OrderId('I123');
      const internalOrder = new InternalOrder(
        orderId,
        [new OrderItemDetail(new OrderItem(new ItemId(1), 5), 5, 10)],
        OrderState.SHIPPED,
        new Date(),
        1,
        2,
        new OrderId('S456')
      );

      ordersRepositoryMongo.getById.mockResolvedValue(internalOrder);

      await service.receiveOrder(orderId);

      expect(outboundEventAdapter.receiveShipment).toHaveBeenCalled();
    });

    it('should not receive SellOrder shipment', async () => {
      const orderId = new OrderId('S123');
      const sellOrder = new SellOrder(
        orderId,
        [new OrderItemDetail(new OrderItem(new ItemId(1), 5), 5, 10)],
        OrderState.SHIPPED,
        new Date(),
        1,
        'Via Roma'
      );

      ordersRepositoryMongo.getById.mockResolvedValue(sellOrder);

      await service.receiveOrder(orderId);

      expect(outboundEventAdapter.receiveShipment).not.toHaveBeenCalled();
    });
  });

  describe('completeOrder', () => {
    it('should complete SellOrder', async () => {
      const orderId = new OrderId('S123');
      const sellOrder = new SellOrder(
        orderId,
        [new OrderItemDetail(new OrderItem(new ItemId(1), 5), 5, 10)],
        OrderState.SHIPPED,
        new Date(),
        1,
        'Via Roma'
      );

      jest.spyOn(service, 'updateOrderState').mockResolvedValue();
      ordersRepositoryMongo.getById.mockResolvedValue(sellOrder);

      await service.completeOrder(orderId);

      expect(service.updateOrderState).toHaveBeenCalledWith(orderId, OrderState.COMPLETED);
    });

    it('should complete InternalOrder in destination warehouse', async () => {
      process.env.WAREHOUSE_ID = '2';
      
      const orderId = new OrderId('I123');
      const internalOrder = new InternalOrder(
        orderId,
        [new OrderItemDetail(new OrderItem(new ItemId(1), 5), 5, 10)],
        OrderState.SHIPPED,
        new Date(),
        1,
        2, // warehouseDestination matches WAREHOUSE_ID
        new OrderId('S456')
      );

      const sellOrder = new SellOrder(
        new OrderId('S456'),
        [new OrderItemDetail(new OrderItem(new ItemId(1), 5), 0, 10)],
        OrderState.PROCESSING,
        new Date(),
        2,
        'Via Roma'
      );

      jest.spyOn(service, 'updateOrderState').mockResolvedValue();
      ordersRepositoryMongo.getById.mockResolvedValueOnce(internalOrder);
      ordersRepositoryMongo.getById.mockResolvedValueOnce(sellOrder);

      await service.completeOrder(orderId);

      expect(outboundEventAdapter.orderCompleted).toHaveBeenCalled();
      expect(outboundEventAdapter.publishReserveStock).toHaveBeenCalled();
    });

    it('should complete InternalOrder not in destination warehouse', async () => {
      process.env.WAREHOUSE_ID = '1';
      
      const orderId = new OrderId('I123');
      const internalOrder = new InternalOrder(
        orderId,
        [new OrderItemDetail(new OrderItem(new ItemId(1), 5), 5, 10)],
        OrderState.SHIPPED,
        new Date(),
        1,
        2, // warehouseDestination different from WAREHOUSE_ID
        new OrderId('S456')
      );

      jest.spyOn(service, 'updateOrderState').mockResolvedValue();
      ordersRepositoryMongo.getById.mockResolvedValue(internalOrder);

      await service.completeOrder(orderId);

      expect(outboundEventAdapter.orderCompleted).not.toHaveBeenCalled();
    });
  });

  // Test aggiuntivi per edge cases
  describe('edge cases', () => {
    it('should handle empty items array in updateReservedStock', async () => {
      const orderId = new OrderId('S123');
      const sellOrder = new SellOrder(
        orderId,
        [],
        OrderState.PROCESSING,
        new Date(),
        1,
        'Via Roma'
      );

      ordersRepositoryMongo.getById.mockResolvedValue(sellOrder);
      ordersRepositoryMongo.updateReservedStock.mockResolvedValue(sellOrder);

      await service.updateReservedStock(orderId, []);

      expect(ordersRepositoryMongo.updateReservedStock).toHaveBeenCalled();
    });

    it('should handle non-matching items in updateReservedStock', async () => {
      const orderId = new OrderId('S123');
      const sellOrder = new SellOrder(
        orderId,
        [new OrderItemDetail(new OrderItem(new ItemId(1), 5), 3, 10)],
        OrderState.PROCESSING,
        new Date(),
        1,
        'Via Roma'
      );

      const items = [new OrderItem(new ItemId(2), 2)]; // Different item ID

      ordersRepositoryMongo.getById.mockResolvedValue(sellOrder);
      ordersRepositoryMongo.updateReservedStock.mockResolvedValue(sellOrder);

      await service.updateReservedStock(orderId, items);

      expect(ordersRepositoryMongo.updateReservedStock).toHaveBeenCalled();
    });

    it('should handle errors in checkReservedQuantity methods', async () => {
      const sellOrder = new SellOrder(
        new OrderId('S123'),
        [new OrderItemDetail(new OrderItem(new ItemId(1), 5), 5, 10)],
        OrderState.PROCESSING,
        new Date(),
        1,
        'Via Roma'
      );

      ordersRepositoryMongo.checkReservedQuantityForSellOrder.mockRejectedValue(
        new Error('Unexpected error')
      );

      await expect(service.checkReservedQuantityForSellOrder(sellOrder))
        .rejects.toThrow('Unexpected error');
    });
  });
});