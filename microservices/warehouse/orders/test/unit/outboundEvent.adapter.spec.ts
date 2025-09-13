import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { OutboundEventAdapter } from 'src/infrastructure/adapters/outboundEvent.adapter';
import { DataMapper } from 'src/infrastructure/mappers/data.mapper';

// Domain entities
import { OrderId } from 'src/domain/orderId.entity';
import { InternalOrder } from 'src/domain/internalOrder.entity';
import { SellOrder } from 'src/domain/sellOrder.entity';
import { OrderItem } from 'src/domain/orderItem.entity';
import { OrderState } from 'src/domain/orderState.enum';
import { ItemId } from 'src/domain/itemId.entity';
import { OrderItemDetail } from 'src/domain/orderItemDetail.entity';

// DTOs
import { OrderIdDTO } from 'src/interfaces/dto/orderId.dto';
import { InternalOrderDTO } from 'src/interfaces/dto/internalOrder.dto';
import { SellOrderDTO } from 'src/interfaces/dto/sellOrder.dto';

// Mocks
jest.mock('src/infrastructure/mappers/data.mapper');

describe('OutboundEventAdapter', () => {
  let adapter: OutboundEventAdapter;
  let natsService: jest.Mocked<ClientProxy>;
  let dataMapper: jest.Mocked<DataMapper>;

  // Mock process.env
  beforeAll(() => {
    process.env.WAREHOUSE_ID = '1';
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OutboundEventAdapter,
        {
          provide: 'NATS_SERVICE',
          useValue: {
            connect: jest.fn(),
            emit: jest.fn(),
          },
        },
        {
          provide: DataMapper,
          useValue: {
            orderIdToDTO: jest.fn(),
            orderItemToDTO: jest.fn(),
            internalOrderToDTO: jest.fn(),
            sellOrderToDTO: jest.fn(),
          },
        },
      ],
    }).compile();

    adapter = module.get<OutboundEventAdapter>(OutboundEventAdapter);
    natsService = module.get('NATS_SERVICE');
    dataMapper = module.get(DataMapper);

    // Mock logger
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('should connect to NATS successfully', async () => {
      natsService.connect.mockResolvedValue(undefined);

      await adapter.onModuleInit();

      expect(natsService.connect).toHaveBeenCalled();
    });

    it('should handle NATS connection error', async () => {
      const error = new Error('Connection failed');
      natsService.connect.mockRejectedValue(error);

      await adapter.onModuleInit();

      expect(natsService.connect).toHaveBeenCalled();
      expect(Logger.prototype.error).toHaveBeenCalledWith('Error connecting to NATS service', error);
    });
  });

  describe('waitingForStock', () => {
    it('should publish waiting for stock event', async () => {
      const orderId = new OrderId('I123');
      const warehouseDepartureId = '2';

      await adapter.waitingForStock(orderId, warehouseDepartureId);

      expect(natsService.emit).toHaveBeenCalledWith(
        'event.warehouse.2.order.I123.waitingStock',
        '{}'
      );
    });
  });

  describe('publishReserveStock', () => {
    it('should publish reserve stock event', async () => {
      const orderId = new OrderId('I123');
      const items = [new OrderItem(new ItemId(1), 5)];
      
      const orderIdDTO: OrderIdDTO = { id: 'I123' };
      const itemsDTO = [{ itemId: { id: 1 }, quantity: 5 }];

      dataMapper.orderIdToDTO.mockResolvedValue(orderIdDTO);
      dataMapper.orderItemToDTO.mockResolvedValue(itemsDTO[0]);

      await adapter.publishReserveStock(orderId, items);

      expect(natsService.emit).toHaveBeenCalledWith(
        'event.warehouse.1.order.request',
        JSON.stringify({ orderIdDTO, itemsDTO })
      );
    });
  });

  describe('publishUpdatedReservedStock', () => {
    it('should publish updated reserved stock event', async () => {
      const orderId = new OrderId('I123');
      const items = [new OrderItem(new ItemId(1), 5)];
      
      const orderIdDTO: OrderIdDTO = { id: 'I123' };
      const itemsDTO = [{ itemId: { id: 1 }, quantity: 5 }];

      dataMapper.orderIdToDTO.mockResolvedValue(orderIdDTO);
      dataMapper.orderItemToDTO.mockResolvedValue(itemsDTO[0]);

      await adapter.publishUpdatedReservedStock(orderId, items);

      expect(natsService.emit).toHaveBeenCalledWith(
        'event.aggregate.orders.stock.reserved',
        JSON.stringify({ orderIdDTO, itemsDTO })
      );
    });
  });

  describe('unreserveStock', () => {
    it('should publish unreserve stock events', async () => {
      const orderId = new OrderId('I123');
      const items = [new OrderItem(new ItemId(1), 5)];
      
      const orderIdDTO: OrderIdDTO = { id: 'I123' };
      const itemsDTO = [{ itemId: { id: 1 }, quantity: 5 }];

      dataMapper.orderIdToDTO.mockResolvedValue(orderIdDTO);
      dataMapper.orderItemToDTO.mockResolvedValue(itemsDTO[0]);

      await adapter.unreserveStock(orderId, items);

      expect(natsService.emit).toHaveBeenCalledWith(
        'event.warehouse.1.inventory.unreserveStock',
        JSON.stringify({ orderIdDTO, itemsDTO })
      );
      expect(natsService.emit).toHaveBeenCalledWith(
        'event.aggregate.orders.stock.unreserve',
        JSON.stringify({ orderIdDTO })
      );
    });
  });

  describe('publishShipment', () => {
    it('should publish shipment event', async () => {
      const orderId = new OrderId('I123');
      const items = [new OrderItem(new ItemId(1), 5)];
      
      const orderIdDTO: OrderIdDTO = { id: 'I123' };
      const itemsDTO = [{ itemId: { id: 1 }, quantity: 5 }];

      dataMapper.orderIdToDTO.mockResolvedValue(orderIdDTO);
      dataMapper.orderItemToDTO.mockResolvedValue(itemsDTO[0]);

      await adapter.publishShipment(orderId, items);

      expect(natsService.emit).toHaveBeenCalledWith(
        'event.warehouse.1.inventory.ship.items',
        JSON.stringify({ orderIdDTO, itemsDTO })
      );
    });
  });

  describe('publishStockRepl', () => {
    it('should publish stock replenishment event', async () => {
      const orderId = new OrderId('I123');
      const items = [new OrderItem(new ItemId(1), 5)];
      
      const orderIdDTO: OrderIdDTO = { id: 'I123' };
      const itemsDTO = [{ itemId: { id: 1 }, quantity: 5 }];

      dataMapper.orderIdToDTO.mockResolvedValue(orderIdDTO);
      dataMapper.orderItemToDTO.mockResolvedValue(itemsDTO[0]);

      await adapter.publishStockRepl(orderId, items);

      expect(natsService.emit).toHaveBeenCalledWith(
        'event.warehouse.1.centralSystem.request',
        JSON.stringify({ orderIdDTO, itemsDTO, warehouseId: '1' })
      );
    });
  });

  describe('receiveShipment', () => {
    it('should publish receive shipment event', async () => {
      const orderId = new OrderId('I123');
      const items = [new OrderItem(new ItemId(1), 5)];
      const destination = 2;
      
      const orderIdDTO: OrderIdDTO = { id: 'I123' };
      const itemsDTO = [{ itemId: { id: 1 }, quantity: 5 }];

      dataMapper.orderIdToDTO.mockResolvedValue(orderIdDTO);
      dataMapper.orderItemToDTO.mockResolvedValue(itemsDTO[0]);

      await adapter.receiveShipment(orderId, items, destination);

      expect(natsService.emit).toHaveBeenCalledWith(
        'event.warehouse.2.inventory.receiveShipment',
        JSON.stringify({ orderIdDTO, itemsDTO })
      );
    });
  });

  describe('orderStateUpdated', () => {
    it('should publish order state update to aggregate', async () => {
      const orderId = new OrderId('I123');
      const orderState = OrderState.PROCESSING;

      await adapter.orderStateUpdated(orderId, orderState, { destination: 'aggregate' });

      expect(natsService.emit).toHaveBeenCalledWith(
        'event.aggregate.order.I123.state.update.PROCESSING',
        '{}'
      );
    });

    it('should publish order state update to warehouse', async () => {
      const orderId = new OrderId('I123');
      const orderState = OrderState.PROCESSING;

      await adapter.orderStateUpdated(orderId, orderState, { 
        destination: 'warehouse', 
        warehouseId: 2 
      });

      expect(natsService.emit).toHaveBeenCalledWith(
        'event.warehouse.2.order.I123.state.update.PROCESSING',
        '{}'
      );
    });

    it('should handle errors in orderStateUpdated', async () => {
      const orderId = new OrderId('I123');
      const orderState = OrderState.PROCESSING;

      (natsService.emit as jest.Mock).mockRejectedValue(new Error('NATS error'));

      await expect(adapter.orderStateUpdated(orderId, orderState, { destination: 'aggregate' }))
        .rejects.toThrow('NATS error');
    });
  });

  describe('orderCancelled', () => {
    it('should publish order cancelled event', async () => {
      const orderId = new OrderId('I123');

      await adapter.orderCancelled(orderId);

      expect(natsService.emit).toHaveBeenCalledWith(
        'event.aggregate.order.I123.cancel',
        '{}'
      );
    });

    it('should handle errors in orderCancelled', async () => {
      const orderId = new OrderId('I123');

      (natsService.emit as jest.Mock).mockRejectedValue(new Error('NATS error'));

      await expect(adapter.orderCancelled(orderId))
        .rejects.toThrow('NATS error');
    });
  });

  describe('orderCompleted', () => {
    it('should publish order completed event', async () => {
      const orderId = new OrderId('I123');
      const warehouse = 2;
      
      const orderIdDTO: OrderIdDTO = { id: 'I123' };
      dataMapper.orderIdToDTO.mockResolvedValue(orderIdDTO);

      await adapter.orderCompleted(orderId, warehouse);

      expect(natsService.emit).toHaveBeenCalledWith(
        'event.warehouse.2.order.I123.complete',
        '{}'
      );
    });

    it('should handle errors in orderCompleted', async () => {
      const orderId = new OrderId('I123');
      const warehouse = 2;
      
      dataMapper.orderIdToDTO.mockRejectedValue(new Error('Mapping error'));

      await expect(adapter.orderCompleted(orderId, warehouse))
        .rejects.toThrow('Mapping error');
    });
  });

  describe('publishInternalOrder', () => {
    it('should publish internal order to aggregate', async () => {
      const internalOrder = new InternalOrder(
        new OrderId('I123'),
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

      dataMapper.internalOrderToDTO.mockResolvedValue(internalOrderDTO);

      await adapter.publishInternalOrder(internalOrder, { destination: 'aggregate' });

      expect(natsService.emit).toHaveBeenCalledWith(
        'event.aggregate.order.internal.new',
        JSON.stringify(internalOrderDTO)
      );
    });

    it('should publish internal order to warehouse', async () => {
      const internalOrder = new InternalOrder(
        new OrderId('I123'),
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

      dataMapper.internalOrderToDTO.mockResolvedValue(internalOrderDTO);

      await adapter.publishInternalOrder(internalOrder, { 
        destination: 'warehouse', 
        warehouseId: 2 
      });

      expect(natsService.emit).toHaveBeenCalledWith(
        'event.warehouse.2.order.internal.new',
        JSON.stringify(internalOrderDTO)
      );
    });
  });

  describe('publishSellOrder', () => {
    it('should publish sell order to aggregate', async () => {
      const sellOrder = new SellOrder(
        new OrderId('S123'),
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

      dataMapper.sellOrderToDTO.mockResolvedValue(sellOrderDTO);

      const result = await adapter.publishSellOrder(sellOrder, { destination: 'aggregate' });

      expect(natsService.emit).toHaveBeenCalledWith(
        'event.aggregate.order.sell.new',
        JSON.stringify(sellOrderDTO)
      );
      expect(result).toContain('S123');
    });

    it('should return sell order ID as string', async () => {
      const sellOrder = new SellOrder(
        new OrderId('S123'),
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

      dataMapper.sellOrderToDTO.mockResolvedValue(sellOrderDTO);

      const result = await adapter.publishSellOrder(sellOrder, { destination: 'aggregate' });

      expect(result).toBe(JSON.stringify('S123'));
    });
  });

  // Edge cases
  describe('edge cases', () => {
    it('should handle empty items array', async () => {
      const orderId = new OrderId('I123');
      const items: OrderItem[] = [];
      
      const orderIdDTO: OrderIdDTO = { id: 'I123' };
      dataMapper.orderIdToDTO.mockResolvedValue(orderIdDTO);

      await adapter.publishReserveStock(orderId, items);

      expect(natsService.emit).toHaveBeenCalledWith(
        'event.warehouse.1.order.request',
        JSON.stringify({ orderIdDTO, itemsDTO: [] })
      );
    });

    it('should handle multiple items', async () => {
      const orderId = new OrderId('I123');
      const items = [
        new OrderItem(new ItemId(1), 5),
        new OrderItem(new ItemId(2), 3)
      ];
      
      const orderIdDTO: OrderIdDTO = { id: 'I123' };
      const itemsDTO = [
        { itemId: { id: 1 }, quantity: 5 },
        { itemId: { id: 2 }, quantity: 3 }
      ];

      dataMapper.orderIdToDTO.mockResolvedValue(orderIdDTO);
      dataMapper.orderItemToDTO
        .mockResolvedValueOnce(itemsDTO[0])
        .mockResolvedValueOnce(itemsDTO[1]);

      await adapter.publishReserveStock(orderId, items);

      expect(natsService.emit).toHaveBeenCalledWith(
        'event.warehouse.1.order.request',
        JSON.stringify({ orderIdDTO, itemsDTO })
      );
    });

    it('should handle different warehouse IDs', async () => {
      process.env.WAREHOUSE_ID = '3';
      
      const orderId = new OrderId('I123');
      const items = [new OrderItem(new ItemId(1), 5)];
      
      const orderIdDTO: OrderIdDTO = { id: 'I123' };
      const itemsDTO = [{ itemId: { id: 1 }, quantity: 5 }];

      dataMapper.orderIdToDTO.mockResolvedValue(orderIdDTO);
      dataMapper.orderItemToDTO.mockResolvedValue(itemsDTO[0]);

      await adapter.publishReserveStock(orderId, items);

      expect(natsService.emit).toHaveBeenCalledWith(
        'event.warehouse.3.order.request',
        JSON.stringify({ orderIdDTO, itemsDTO })
      );
    });
  });
});