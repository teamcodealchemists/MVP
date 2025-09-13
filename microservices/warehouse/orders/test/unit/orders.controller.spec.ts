import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { MessagePattern, EventPattern, Ctx, Payload } from '@nestjs/microservices';
import { RpcException } from '@nestjs/microservices';

import { OrdersController } from 'src/interfaces/orders.controller';
import { InboundPortsAdapter } from 'src/infrastructure/adapters/inboundPorts.adapter';
import { OrderQuantityDTO } from 'src/interfaces/dto/orderQuantity.dto';
import { OrderStateDTO } from 'src/interfaces/dto/orderState.dto';
import { OrderIdDTO } from 'src/interfaces/dto/orderId.dto';
import { InternalOrderDTO } from 'src/interfaces/dto/internalOrder.dto';
import { SellOrderDTO } from 'src/interfaces/dto/sellOrder.dto';
import { OrderItemDTO } from 'src/interfaces/dto/orderItem.dto';

// Mock dell'adapter
jest.mock('src/infrastructure/adapters/inboundPorts.adapter');

describe('OrdersController', () => {
  let controller: OrdersController;
  let inboundPortsAdapter: jest.Mocked<InboundPortsAdapter>;

  // Mock process.env prima di tutto
  beforeAll(() => {
    process.env.WAREHOUSE_ID = '1';
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: InboundPortsAdapter,
          useValue: {
            stockReserved: jest.fn(),
            addSellOrder: jest.fn(),
            addInternalOrder: jest.fn(),
            sufficientProductAvailability: jest.fn(),
            waitingForStock: jest.fn(),
            stockShipped: jest.fn(),
            stockReceived: jest.fn(),
            replenishmentReceived: jest.fn(),
            updateOrderState: jest.fn(),
            cancelOrder: jest.fn(),
            completeOrder: jest.fn(),
            getOrderState: jest.fn(),
            getOrder: jest.fn(),
            getAllOrders: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    inboundPortsAdapter = module.get(InboundPortsAdapter);

    // Mock logger per evitare output nei test
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('stockReserved', () => {
    it('should call inboundPortsAdapter.stockReserved', async () => {
      const orderQuantityDTO = new OrderQuantityDTO();
      orderQuantityDTO.id = { id: 'I123' };
      orderQuantityDTO.items = [];

      await controller.stockReserved(orderQuantityDTO);

      expect(inboundPortsAdapter.stockReserved).toHaveBeenCalledWith(orderQuantityDTO);
    });
  });

  describe('addSellOrder', () => {
    it('should add sell order successfully', async () => {
      const payload = {
        orderId: { id: 'S123' },
        items: [],
        orderState: { orderState: 'PENDING' },
        creationDate: new Date(),
        warehouseDeparture: 1,
        destinationAddress: 'Via Roma'
      };

      inboundPortsAdapter.addSellOrder.mockResolvedValue('S123');

      const result = await controller.addSellOrder(payload);

      expect(result).toContain('warehouse.1.order.S123');
      expect(inboundPortsAdapter.addSellOrder).toHaveBeenCalled();
    });

    it('should handle errors when adding sell order', async () => {
      const payload = {
        orderId: { id: 'S123' },
        items: [],
        orderState: { orderState: 'PENDING' },
        creationDate: new Date(),
        warehouseDeparture: 1,
        destinationAddress: 'Via Roma'
      };

      inboundPortsAdapter.addSellOrder.mockRejectedValue(new Error('Database error'));

      const result = await controller.addSellOrder(payload);

      expect(result).toContain('system.internalError');
      expect(result).toContain('Database error');
    });
  });

  describe('addInternalOrder', () => {
    it('should add internal order successfully', async () => {
      const payload = {
        orderId: { id: 'I123' },
        items: [],
        orderState: { orderState: 'PENDING' },
        creationDate: new Date(),
        warehouseDeparture: 1,
        warehouseDestination: 2,
        sellOrderReference: { id: 'S456' }
      };

      inboundPortsAdapter.addInternalOrder.mockResolvedValue('I123');

      const result = await controller.addInternalOrder(payload);

      expect(result).toContain('warehouse.1.order.I123');
      expect(inboundPortsAdapter.addInternalOrder).toHaveBeenCalled();
    });

    it('should handle errors when adding internal order', async () => {
      const payload = {
        orderId: { id: 'I123' },
        items: [],
        orderState: { orderState: 'PENDING' },
        creationDate: new Date(),
        warehouseDeparture: 1,
        warehouseDestination: 2
      };

      inboundPortsAdapter.addInternalOrder.mockRejectedValue(new Error('Database error'));

      const result = await controller.addInternalOrder(payload);

      expect(result).toContain('system.internalError');
    });
  });

  describe('addInternalOrderEvent', () => {
    it('should handle internal order event successfully', async () => {
      const payload = {
        orderId: { id: 'I123' },
        items: [],
        orderState: { orderState: 'PENDING' },
        creationDate: new Date(),
        warehouseDeparture: 1,
        warehouseDestination: 2,
        sellOrderReference: { id: 'S456' }
      };

      inboundPortsAdapter.addInternalOrder.mockResolvedValue('I123');

      const result = await controller.addInternalOrderEvent(payload);

      expect(result).toContain('warehouse.1.order.I123');
    });
  });

  describe('sufficientProductAvailability', () => {
    it('should handle sufficient product availability', async () => {
      const payload = {
        orderId: { id: 'I123' }
      };

      await controller.sufficientProductAvailability(payload);

      expect(inboundPortsAdapter.sufficientProductAvailability).toHaveBeenCalled();
    });
  });

  describe('waitingForStock', () => {
    it('should handle waiting for stock', async () => {
      const mockContext = {
        getSubject: jest.fn().mockReturnValue('event.warehouse.1.order.I123.waitingStock')
      };

      await controller.waitingForStock(mockContext as any);

      expect(inboundPortsAdapter.waitingForStock).toHaveBeenCalledWith('I123');
    });
  });

  describe('stockShipped', () => {
    it('should handle stock shipped event', async () => {
      const mockContext = {
        getSubject: jest.fn().mockReturnValue('warehouse.1.order.I123.stockShipped')
      };

      await controller.stockShipped(mockContext as any);

      expect(inboundPortsAdapter.stockShipped).toHaveBeenCalledWith('I123');
    });
  });

  describe('stockReceived', () => {
    it('should handle stock received event', async () => {
      const mockContext = {
        getSubject: jest.fn().mockReturnValue('warehouse.1.order.I123.stockReceived')
      };

      await controller.stockReceived(mockContext as any);

      expect(inboundPortsAdapter.stockReceived).toHaveBeenCalled();
    });
  });

  describe('replenishmentReceived', () => {
    it('should handle replenishment received', async () => {
      const mockContext = {
        getSubject: jest.fn().mockReturnValue('call.warehouse.1.order.I123.replenishment.received')
      };

      const payload = {
        product: {
          id: { id: 'I123' },
          productQuantityArray: [
            { productId: { id: 1 }, quantity: 5 }
          ]
        }
      };

      await controller.replenishmentReceived(mockContext as any, payload);

      expect(inboundPortsAdapter.replenishmentReceived).toHaveBeenCalled();
    });
  });

  describe('updateOrderState', () => {
    it('should update order state successfully', async () => {
      const mockContext = {
        getSubject: jest.fn().mockReturnValue('call.warehouse.1.order.I123.state.update.PROCESSING')
      };

      inboundPortsAdapter.updateOrderState.mockResolvedValue();

      const result = await controller.updateOrderState(mockContext as any);

      expect(result).toContain('Order I123 state updated to PROCESSING');
    });

    it('should handle errors when updating order state', async () => {
      const mockContext = {
        getSubject: jest.fn().mockReturnValue('call.warehouse.1.order.I123.state.update.PROCESSING')
      };

      inboundPortsAdapter.updateOrderState.mockRejectedValue(new Error('Update error'));

      const result = await controller.updateOrderState(mockContext as any);

      expect(result).toContain('system.internalError');
    });
  });

  describe('updateOrderStateEvent', () => {
    it('should update order state from event', async () => {
      const mockContext = {
        getSubject: jest.fn().mockReturnValue('event.warehouse.1.order.I123.state.update.PROCESSING')
      };

      await controller.updateOrderStateEvent(mockContext as any);

      expect(inboundPortsAdapter.updateOrderState).toHaveBeenCalledWith('I123', 'PROCESSING');
    });

    it('should throw error when update fails', async () => {
      const mockContext = {
        getSubject: jest.fn().mockReturnValue('event.warehouse.1.order.I123.state.update.PROCESSING')
      };

      inboundPortsAdapter.updateOrderState.mockRejectedValue(new Error('Update error'));

      await expect(controller.updateOrderStateEvent(mockContext as any))
        .rejects.toThrow('Update error');
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order successfully', async () => {
      const mockContext = {
        getSubject: jest.fn().mockReturnValue('call.warehouse.1.order.I123.cancel')
      };

      await controller.cancelOrder(mockContext as any);

      expect(inboundPortsAdapter.cancelOrder).toHaveBeenCalledWith('I123');
    });

    it('should throw RpcException when cancel fails', async () => {
      const mockContext = {
        getSubject: jest.fn().mockReturnValue('call.warehouse.1.order.I123.cancel')
      };

      inboundPortsAdapter.cancelOrder.mockRejectedValue(new Error('Cancel error'));

      await expect(controller.cancelOrder(mockContext as any))
        .rejects.toThrow(RpcException);
    });
  });

  describe('completeOrder', () => {
    it('should complete order', async () => {
      const mockContext = {
        getSubject: jest.fn().mockReturnValue('event.warehouse.1.order.I123.complete')
      };

      await controller.completeOrder(mockContext as any);

      expect(inboundPortsAdapter.completeOrder).toHaveBeenCalledWith('I123');
    });
  });

  describe('getOrderState', () => {
    it('should get order state', async () => {
      const mockContext = {
        getSubject: jest.fn().mockReturnValue('get.warehouse.1.order.I123.state')
      };

    const orderStateDTO: OrderStateDTO = {
      orderState: 'PENDING'
    };

    inboundPortsAdapter.getOrderState.mockResolvedValue(orderStateDTO);

      const result = await controller.getOrderState(mockContext as any);

      expect(result).toContain('PENDING');
      expect(inboundPortsAdapter.getOrderState).toHaveBeenCalledWith('I123');
    });
  });

  describe('getOrder', () => {
    it('should get sell order', async () => {
      const mockContext = {
        getSubject: jest.fn().mockReturnValue('get.warehouse.1.order.S123')
      };

      const sellOrder = {
        orderId: { id: 'S123' },
        orderState: { orderState: 'PENDING' },
        creationDate: new Date(),
        warehouseDeparture: 1,
        destinationAddress: 'Via Roma'
      };

      inboundPortsAdapter.getOrder.mockResolvedValue(sellOrder as any);

      const result = await controller.getOrder(mockContext as any);

      expect(result).toContain('S123');
      expect(result).toContain('Via Roma');
    });

    it('should get internal order', async () => {
      const mockContext = {
        getSubject: jest.fn().mockReturnValue('get.warehouse.1.order.I123')
      };

      const internalOrder = {
        orderId: { id: 'I123' },
        orderState: { orderState: 'PENDING' },
        creationDate: new Date(),
        warehouseDeparture: 1,
        warehouseDestination: 2,
        sellOrderReference: { id: 'S456' }
      };

      inboundPortsAdapter.getOrder.mockResolvedValue(internalOrder as any);

      const result = await controller.getOrder(mockContext as any);

      expect(result).toContain('I123');
      expect(result).toContain('warehouseDestination');
    });
  });

  describe('getOrdersCollection', () => {
    it('should get orders collection', async () => {
      const orders = {
        internalOrders: [
          { orderId: { id: 'I123' } }
        ],
        sellOrders: [
          { orderId: { id: 'S123' } }
        ]
      };

      inboundPortsAdapter.getAllOrders.mockResolvedValue(orders as any);

      const result = await controller.getOrdersCollection();

      expect(result).toContain('warehouse.1.order.I123');
      expect(result).toContain('warehouse.1.order.S123');
    });
  });

  // Test aggiuntivi per edge cases
  describe('edge cases', () => {
    it('should handle empty sellOrderReference in addInternalOrder', async () => {
      const payload = {
        orderId: { id: 'I123' },
        items: [],
        orderState: { orderState: 'PENDING' },
        creationDate: new Date(),
        warehouseDeparture: 1,
        warehouseDestination: 2,
        sellOrderReference: ""
      };

      inboundPortsAdapter.addInternalOrder.mockResolvedValue('I123');

      const result = await controller.addInternalOrder(payload);

      expect(result).toContain('warehouse.1.order.I123');
    });

    it('should handle different warehouse IDs in context parsing', async () => {
      const mockContext = {
        getSubject: jest.fn().mockReturnValue('call.warehouse.2.order.I123.state.update.PROCESSING')
      };

      await controller.updateOrderState(mockContext as any);

      expect(inboundPortsAdapter.updateOrderState).toHaveBeenCalledWith('I123', 'PROCESSING');
    });
  });
});