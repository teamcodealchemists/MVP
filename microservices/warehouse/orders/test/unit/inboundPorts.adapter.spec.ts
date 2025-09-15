import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { InboundPortsAdapter } from 'src/infrastructure/adapters/inboundPorts.adapter';
import { OrdersService } from 'src/application/orders.service';
import { DataMapper } from 'src/infrastructure/mappers/data.mapper';
import { OrdersRepository } from 'src/domain/orders.repository';

// Domain entities
import { OrderId } from 'src/domain/orderId.entity';
import { Orders } from 'src/domain/orders.entity';
import { InternalOrder } from 'src/domain/internalOrder.entity';
import { SellOrder } from 'src/domain/sellOrder.entity';
import { OrderItem } from 'src/domain/orderItem.entity';
import { OrderItemDetail } from 'src/domain/orderItemDetail.entity';
import { OrderState } from 'src/domain/orderState.enum';
import { ItemId } from 'src/domain/itemId.entity';

// DTOs
import { OrderQuantityDTO } from 'src/interfaces/dto/orderQuantity.dto';
import { OrderIdDTO } from 'src/interfaces/dto/orderId.dto';
import { OrderStateDTO } from 'src/interfaces/dto/orderState.dto';
import { InternalOrderDTO } from 'src/interfaces/dto/internalOrder.dto';
import { SellOrderDTO } from 'src/interfaces/dto/sellOrder.dto';
import { OrdersDTO } from 'src/interfaces/dto/orders.dto';

// Mocks
jest.mock('src/application/orders.service');
jest.mock('src/infrastructure/mappers/data.mapper');

describe('InboundPortsAdapter', () => {
  let adapter: InboundPortsAdapter;
  let ordersService: jest.Mocked<OrdersService>;
  let dataMapper: jest.Mocked<DataMapper>;
  let ordersRepository: jest.Mocked<OrdersRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InboundPortsAdapter,
        {
          provide: OrdersService,
          useValue: {
            updateReservedStock: jest.fn(),
            updateFullReservedStock: jest.fn(),
            createSellOrder: jest.fn(),
            createInternalOrder: jest.fn(),
            shipOrder: jest.fn(),
            updateOrderState: jest.fn(),
            completeOrder: jest.fn(),
            receiveOrder: jest.fn(),
            checkReservedQuantityForSellOrder: jest.fn(),
            checkReservedQuantityForInternalOrder: jest.fn(),
          },
        },
        {
          provide: DataMapper,
          useValue: {
            orderIdToDomain: jest.fn(),
            orderItemToDomain: jest.fn(),
            sellOrderToDomain: jest.fn(),
            internalOrderToDomain: jest.fn(),
            orderStateToDomain: jest.fn(),
            orderStateToDTO: jest.fn(),
            internalOrderToDTO: jest.fn(),
            sellOrderToDTO: jest.fn(),
            ordersToDTO: jest.fn(),
          },
        },
        {
          provide: 'ORDERSREPOSITORY',
          useValue: {
            getById: jest.fn(),
            getState: jest.fn(),
            getAllOrders: jest.fn(),
            updateReservedStock: jest.fn(),
          },
        },
      ],
    }).compile();

    adapter = module.get<InboundPortsAdapter>(InboundPortsAdapter);
    ordersService = module.get(OrdersService);
    dataMapper = module.get(DataMapper);
    ordersRepository = module.get('ORDERSREPOSITORY');

    // Mock logger
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('stockReserved', () => {
    it('should update reserved stock', async () => {
      const orderQuantityDTO: OrderQuantityDTO = {
        id: { id: 'I123' },
        items: [{ itemId: { id: 1 }, quantity: 5 }]
      };

      const orderIdDomain = new OrderId('I123');
      const orderItemDomain = new OrderItem(new ItemId(1), 5);

      dataMapper.orderIdToDomain.mockResolvedValue(orderIdDomain);
      dataMapper.orderItemToDomain.mockResolvedValue(orderItemDomain);

      await adapter.stockReserved(orderQuantityDTO);

      expect(ordersService.updateReservedStock).toHaveBeenCalledWith(
        orderIdDomain,
        [orderItemDomain]
      );
    });
  });

  describe('sufficientProductAvailability', () => {
    it('should update full reserved stock', async () => {
      const orderIdDTO: OrderIdDTO = { id: 'I123' };
      const orderIdDomain = new OrderId('I123');

      dataMapper.orderIdToDomain.mockResolvedValue(orderIdDomain);

      await adapter.sufficientProductAvailability(orderIdDTO);

      expect(ordersService.updateFullReservedStock).toHaveBeenCalledWith(orderIdDomain);
    });
  });

  describe('addSellOrder', () => {
    it('should add sell order', async () => {
      const sellOrderDTO: SellOrderDTO = {
        orderId: { id: 'S123' },
        items: [],
        orderState: { orderState: 'PENDING' },
        creationDate: new Date(),
        warehouseDeparture: 1,
        destinationAddress: 'Via Roma'
      };

      const sellOrderDomain = new SellOrder(
        new OrderId('S123'),
        [],
        OrderState.PENDING,
        new Date(),
        1,
        'Via Roma'
      );

      dataMapper.sellOrderToDomain.mockResolvedValue(sellOrderDomain);
      ordersService.createSellOrder.mockResolvedValue('S123');

      const result = await adapter.addSellOrder(sellOrderDTO);

      expect(result).toBe('S123');
      expect(ordersService.createSellOrder).toHaveBeenCalledWith(sellOrderDomain);
    });
  });

  describe('addInternalOrder', () => {
    it('should add internal order', async () => {
      const internalOrderDTO: InternalOrderDTO = {
        orderId: { id: 'I123' },
        items: [],
        orderState: { orderState: 'PENDING' },
        creationDate: new Date(),
        warehouseDeparture: 1,
        warehouseDestination: 2,
        sellOrderReference: { id: 'S456' }
      };

      const internalOrderDomain = new InternalOrder(
        new OrderId('I123'),
        [],
        OrderState.PENDING,
        new Date(),
        1,
        2,
        new OrderId('S456')
      );

      dataMapper.internalOrderToDomain.mockResolvedValue(internalOrderDomain);
      ordersService.createInternalOrder.mockResolvedValue('I123');

      const result = await adapter.addInternalOrder(internalOrderDTO);

      expect(result).toBe('I123');
      expect(ordersService.createInternalOrder).toHaveBeenCalledWith(internalOrderDomain);
    });
  });

  describe('waitingForStock', () => {
    it('should ship order when waiting for stock', async () => {
      const orderId = 'I123';
      const orderIdDomain = new OrderId('I123');

      dataMapper.orderIdToDomain.mockResolvedValue(orderIdDomain);

      await adapter.waitingForStock(orderId);

      expect(ordersService.shipOrder).toHaveBeenCalledWith(orderIdDomain);
    });
  });

  describe('stockShipped', () => {
    it('should complete sell order when shipped', async () => {
      const orderId = 'S123';
      const orderIdDomain = new OrderId('S123');
      const sellOrder = new SellOrder(
        orderIdDomain,
        [],
        OrderState.PROCESSING,
        new Date(),
        1,
        'Via Roma'
      );

      dataMapper.orderIdToDomain.mockResolvedValue(orderIdDomain);
      ordersRepository.getById.mockResolvedValue(sellOrder);

      await adapter.stockShipped(orderId);

      expect(ordersService.updateOrderState).toHaveBeenCalledWith(orderIdDomain, OrderState.SHIPPED);
      expect(ordersService.completeOrder).toHaveBeenCalledWith(orderIdDomain);
    });

    it('should receive internal order when shipped', async () => {
      const orderId = 'I123';
      const orderIdDomain = new OrderId('I123');
      const internalOrder = new InternalOrder(
        orderIdDomain,
        [],
        OrderState.PROCESSING,
        new Date(),
        1,
        2,
        new OrderId('S456')
      );

      dataMapper.orderIdToDomain.mockResolvedValue(orderIdDomain);
      ordersRepository.getById.mockResolvedValue(internalOrder);

      await adapter.stockShipped(orderId);

      expect(ordersService.receiveOrder).toHaveBeenCalledWith(orderIdDomain);
    });
  });

  describe('stockReceived', () => {
    it('should complete order when stock received', async () => {
      const orderIdDTO: OrderIdDTO = { id: 'I123' };
      const orderIdDomain = new OrderId('I123');

      dataMapper.orderIdToDomain.mockResolvedValue(orderIdDomain);

      await adapter.stockReceived(orderIdDTO);

      expect(ordersService.completeOrder).toHaveBeenCalledWith(orderIdDomain);
    });
  });

  describe('replenishmentReceived', () => {
    it('should handle replenishment for sell order', async () => {
      const orderQuantityDTO: OrderQuantityDTO = {
        id: { id: 'S123' },
        items: [{ itemId: { id: 1 }, quantity: 3 }]
      };

      const orderIdDomain = new OrderId('S123');
      const sellOrder = new SellOrder(
        orderIdDomain,
        [new OrderItemDetail(new OrderItem(new ItemId(1), 5), 2, 10)],
        OrderState.PROCESSING,
        new Date(),
        1,
        'Via Roma'
      );

      dataMapper.orderIdToDomain.mockResolvedValue(orderIdDomain);
      ordersRepository.getById.mockResolvedValue(sellOrder);
      ordersRepository.updateReservedStock.mockResolvedValue(sellOrder);

      await adapter.replenishmentReceived(orderQuantityDTO);

      expect(ordersRepository.updateReservedStock).toHaveBeenCalled();
      expect(ordersService.checkReservedQuantityForSellOrder).toHaveBeenCalled();
    });

    it('should handle replenishment for internal order', async () => {
      const orderQuantityDTO: OrderQuantityDTO = {
        id: { id: 'I123' },
        items: [{ itemId: { id: 1 }, quantity: 3 }]
      };

      const orderIdDomain = new OrderId('I123');
      const internalOrder = new InternalOrder(
        orderIdDomain,
        [new OrderItemDetail(new OrderItem(new ItemId(1), 5), 2, 10)],
        OrderState.PROCESSING,
        new Date(),
        1,
        2,
        new OrderId('S456')
      );

      dataMapper.orderIdToDomain.mockResolvedValue(orderIdDomain);
      ordersRepository.getById.mockResolvedValue(internalOrder);
      ordersRepository.updateReservedStock.mockResolvedValue(internalOrder);

      await adapter.replenishmentReceived(orderQuantityDTO);

      expect(ordersRepository.updateReservedStock).toHaveBeenCalled();
      expect(ordersService.checkReservedQuantityForInternalOrder).toHaveBeenCalled();
    });
  });

  describe('updateOrderState', () => {
    it('should update order state', async () => {
      const orderId = 'I123';
      const orderState = 'PROCESSING';

      const orderIdDTO: OrderIdDTO = { id: orderId };
      const orderStateDTO: OrderStateDTO = { orderState };
      const orderIdDomain = new OrderId('I123');
      const orderStateDomain = OrderState.PROCESSING;

      dataMapper.orderIdToDomain.mockResolvedValue(orderIdDomain);
      dataMapper.orderStateToDomain.mockResolvedValue(orderStateDomain);

      await adapter.updateOrderState(orderId, orderState);

      expect(ordersService.updateOrderState).toHaveBeenCalledWith(
        orderIdDomain,
        orderStateDomain
      );
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order', async () => {
      const orderId = 'I123';
      const orderIdDTO: OrderIdDTO = { id: orderId };
      const orderIdDomain = new OrderId('I123');

      dataMapper.orderIdToDomain.mockResolvedValue(orderIdDomain);

      await adapter.cancelOrder(orderId);

      expect(ordersService.updateOrderState).toHaveBeenCalledWith(
        orderIdDomain,
        OrderState.CANCELED
      );
    });
  });

  describe('completeOrder', () => {
    it('should complete order', async () => {
      const orderId = 'I123';
      const orderIdDTO: OrderIdDTO = { id: orderId };
      const orderIdDomain = new OrderId('I123');

      dataMapper.orderIdToDomain.mockResolvedValue(orderIdDomain);

      await adapter.completeOrder(orderId);

      expect(ordersService.completeOrder).toHaveBeenCalledWith(orderIdDomain);
    });
  });

  describe('getOrderState', () => {
    it('should get order state', async () => {
      const orderId = 'I123';
      const orderIdDTO: OrderIdDTO = { id: orderId };
      const orderIdDomain = new OrderId('I123');
      const orderState = OrderState.PENDING;
      const orderStateDTO: OrderStateDTO = { orderState: 'PENDING' };

      dataMapper.orderIdToDomain.mockResolvedValue(orderIdDomain);
      ordersRepository.getState.mockResolvedValue(orderState);
      dataMapper.orderStateToDTO.mockResolvedValue(orderStateDTO);

      const result = await adapter.getOrderState(orderId);

      expect(result).toEqual(orderStateDTO);
      expect(ordersRepository.getState).toHaveBeenCalledWith(orderIdDomain);
    });
  });

  describe('getOrder', () => {
    it('should get internal order', async () => {
      const orderId = 'I123';
      const orderIdDTO: OrderIdDTO = { id: orderId };
      const orderIdDomain = new OrderId('I123');
      const internalOrder = new InternalOrder(
        orderIdDomain,
        [],
        OrderState.PENDING,
        new Date(),
        1,
        2,
        new OrderId('S456')
      );
      const internalOrderDTO: InternalOrderDTO = {
        orderId: { id: 'I123' },
        items: [],
        orderState: { orderState: 'PENDING' },
        creationDate: new Date(),
        warehouseDeparture: 1,
        warehouseDestination: 2,
        sellOrderReference: { id: 'S456' }
      };

      dataMapper.orderIdToDomain.mockResolvedValue(orderIdDomain);
      ordersRepository.getById.mockResolvedValue(internalOrder);
      dataMapper.internalOrderToDTO.mockResolvedValue(internalOrderDTO);

      const result = await adapter.getOrder(orderId);

      expect(result).toEqual(internalOrderDTO);
    });

    it('should get sell order', async () => {
      const orderId = 'S123';
      const orderIdDTO: OrderIdDTO = { id: orderId };
      const orderIdDomain = new OrderId('S123');
      const sellOrder = new SellOrder(
        orderIdDomain,
        [],
        OrderState.PENDING,
        new Date(),
        1,
        'Via Roma'
      );
      const sellOrderDTO: SellOrderDTO = {
        orderId: { id: 'S123' },
        items: [],
        orderState: { orderState: 'PENDING' },
        creationDate: new Date(),
        warehouseDeparture: 1,
        destinationAddress: 'Via Roma'
      };

      dataMapper.orderIdToDomain.mockResolvedValue(orderIdDomain);
      ordersRepository.getById.mockResolvedValue(sellOrder);
      dataMapper.sellOrderToDTO.mockResolvedValue(sellOrderDTO);

      const result = await adapter.getOrder(orderId);

      expect(result).toEqual(sellOrderDTO);
    });

    it('should throw error for unknown order type', async () => {
      const orderId = 'X123';
      const orderIdDTO: OrderIdDTO = { id: orderId };
      const orderIdDomain = new OrderId('X123');
      const unknownOrder = {} as any;

      dataMapper.orderIdToDomain.mockResolvedValue(orderIdDomain);
      ordersRepository.getById.mockResolvedValue(unknownOrder);

      await expect(adapter.getOrder(orderId))
        .rejects.toThrow('Tipo di ordine non riconosciuto');
    });
  });

  describe('getAllOrders', () => {
    it('should get all orders', async () => {
      const orders = new Orders([], []);
      const ordersDTO: OrdersDTO = {
        sellOrders: [],
        internalOrders: []
      };

      ordersRepository.getAllOrders.mockResolvedValue(orders);
      dataMapper.ordersToDTO.mockResolvedValue(ordersDTO);

      const result = await adapter.getAllOrders();

      expect(result).toEqual(ordersDTO);
      expect(ordersRepository.getAllOrders).toHaveBeenCalled();
    });
  });

  // Edge cases
  describe('edge cases', () => {
    it('should handle empty items in replenishmentReceived', async () => {
      const orderQuantityDTO: OrderQuantityDTO = {
        id: { id: 'S123' },
        items: []
      };

      const orderIdDomain = new OrderId('S123');
      const sellOrder = new SellOrder(
        orderIdDomain,
        [],
        OrderState.PROCESSING,
        new Date(),
        1,
        'Via Roma'
      );

      dataMapper.orderIdToDomain.mockResolvedValue(orderIdDomain);
      ordersRepository.getById.mockResolvedValue(sellOrder);

      await adapter.replenishmentReceived(orderQuantityDTO);

      expect(ordersRepository.updateReservedStock).toHaveBeenCalledWith(
        orderIdDomain,
        []
      );
    });

    it('should handle non-matching items in replenishmentReceived', async () => {
      const orderQuantityDTO: OrderQuantityDTO = {
        id: { id: 'S123' },
        items: [{ itemId: { id: 2 }, quantity: 3 }] // Item ID 2 doesn't exist in order
      };

      const orderIdDomain = new OrderId('S123');
      const sellOrder = new SellOrder(
        orderIdDomain,
        [new OrderItemDetail(new OrderItem(new ItemId(1), 5), 2, 10)], // Only item ID 1
        OrderState.PROCESSING,
        new Date(),
        1,
        'Via Roma'
      );

      dataMapper.orderIdToDomain.mockResolvedValue(orderIdDomain);
      ordersRepository.getById.mockResolvedValue(sellOrder);

      await adapter.replenishmentReceived(orderQuantityDTO);

      // Should still update but without changing quantities
      expect(ordersRepository.updateReservedStock).toHaveBeenCalled();
    });
  });
});