import { Test, TestingModule } from '@nestjs/testing';
import { OutboundPortsAdapter } from 'src/infrastructure/adapters/centralSystemEventAdapter';
import { centralSystemHandler } from 'src/interfaces/centralSystem.handler';
import { InternalOrder } from 'src/domain/internalOrder.entity';
import { Inventory } from 'src/domain/inventory.entity';
import { Orders } from 'src/domain/orders.entity';
import { WarehouseId } from 'src/domain/warehouseId.entity';
import { DataMapper } from 'src/infrastructure/mappers/dataMapper';
import { OrderId } from 'src/domain/orderId.entity';
import { OrderItemDetail } from 'src/domain/orderItemDetail.entity';
import { OrderItem } from 'src/domain/orderItem.entity';
import { ItemId } from 'src/domain/itemId.entity';
import { OrderState } from 'src/domain/orderState.enum';
import { ProductId } from 'src/domain/productId.entity';

describe('OutboundPortsAdapter', () => {
  let adapter: OutboundPortsAdapter;
  let handler: centralSystemHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OutboundPortsAdapter,
        {
          provide: centralSystemHandler,
          useValue: {
            handleNotification: jest.fn(),
            handleOrder: jest.fn(),
            handleCloudInventoryRequest: jest.fn(),
            handleCloudOrdersRequest: jest.fn(),
            handleWarehouseDistance: jest.fn(),
            handleRequestOrdResult: jest.fn(),
            handleRequestInvResult: jest.fn(),
          },
        },
      ],
    }).compile();

    adapter = module.get<OutboundPortsAdapter>(OutboundPortsAdapter);
    handler = module.get<centralSystemHandler>(centralSystemHandler);
  });

  describe('SendNotification', () => {
    it('should call centralSystemHandler.handleNotification', async () => {
      const msg = 'Test notification';
      await adapter.SendNotification(msg);
      expect(handler.handleNotification).toHaveBeenCalledWith(msg);
    });
  });

  describe('createInternalOrder', () => {
    it('should convert InternalOrder to DTO and call handleOrder', async () => {
      const order = new InternalOrder(
        new OrderId('I1'),
        [new OrderItemDetail(new OrderItem(new ItemId(2), 3), 0, 0)],
        OrderState.PROCESSING,
        new Date(),
        2,
        1
      );
      const sellOrderId = new OrderId('S1');
      jest.spyOn(DataMapper, 'internalOrderToDTO').mockResolvedValue({} as any);

      await adapter.createInternalOrder(order, sellOrderId);

      expect(DataMapper.internalOrderToDTO).toHaveBeenCalledWith(order, sellOrderId);
      expect(handler.handleOrder).toHaveBeenCalled();
    });
  });

  describe('CloudInventoryRequest', () => {
    it('should call handler and map to DTO', async () => {
      const inventory = new Inventory([]);
      jest.spyOn(handler, 'handleCloudInventoryRequest').mockResolvedValue(inventory);
      jest.spyOn(DataMapper, 'toDtoInventory').mockReturnValue({} as any);

      const result = await adapter.CloudInventoryRequest();

      expect(handler.handleCloudInventoryRequest).toHaveBeenCalled();
      expect(DataMapper.toDtoInventory).toHaveBeenCalledWith(inventory);
      expect(result).toBeDefined();
    });
  });

  describe('CloudOrderRequest', () => {
    it('should call handler and map to DTO', async () => {
      const orders = new Orders([], []);
      jest.spyOn(handler, 'handleCloudOrdersRequest').mockResolvedValue(orders);
      jest.spyOn(DataMapper, 'ordersToDTO').mockReturnValue({} as any);

      const result = await adapter.CloudOrderRequest();

      expect(handler.handleCloudOrdersRequest).toHaveBeenCalled();
      expect(DataMapper.ordersToDTO).toHaveBeenCalledWith(orders);
      expect(result).toBeDefined();
    });

    it('should return null if handler returns null', async () => {
      jest.spyOn(handler, 'handleCloudOrdersRequest').mockResolvedValue(null);

      const result = await adapter.CloudOrderRequest();

      expect(handler.handleCloudOrdersRequest).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('RequestDistanceWarehouse', () => {
    it('should call handler, map to DTO, and return DTO array', async () => {
      const whId = new WarehouseId(1);
      const domainIds = [new WarehouseId(1), new WarehouseId(2)];
      jest.spyOn(DataMapper, 'warehouseIdToDto').mockImplementation((id) => ({ warehouseId: id.getId() }));
      jest.spyOn(handler, 'handleWarehouseDistance').mockResolvedValue(domainIds);

      const result = await adapter.RequestDistanceWarehouse(whId);

      expect(handler.handleWarehouseDistance).toHaveBeenCalled();
      expect(result.length).toBe(domainIds.length);
      expect(result[0]).toHaveProperty('warehouseId', 1);
      expect(result[1]).toHaveProperty('warehouseId', 2);
    });
  });

  describe('sendOrder', () => {
    it('should call handleRequestOrdResult', async () => {
      const message = 'CANCELORDER';
      const orderId = new OrderId('O1');
      const warehouseId = new WarehouseId(1);
      await adapter.sendOrder(message, orderId, warehouseId);
      expect(handler.handleRequestOrdResult).toHaveBeenCalledWith(message, orderId, warehouseId);
    });
  });

  describe('sendInventory', () => {
    it('should call handleRequestInvResult', async () => {
      const message = 'MIN - Non disponibile';
      const productId = new ProductId('P1');
      const warehouseId = new WarehouseId(1);
      await adapter.sendInventory(message, productId, warehouseId);
      expect(handler.handleRequestInvResult).toHaveBeenCalledWith(message, productId, warehouseId);
    });
  });
});
