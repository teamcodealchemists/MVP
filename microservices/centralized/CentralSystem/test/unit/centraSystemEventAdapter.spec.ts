import { Test, TestingModule } from '@nestjs/testing';
import { OutboundPortsAdapter } from 'src/infrastructure/adapters/centralSystemEventAdapter';
import { centralSystemHandler } from 'src/interfaces/centralSystem.handler';
import { InternalOrder } from 'src/domain/internalOrder.entity';
import { Inventory } from 'src/domain/inventory.entity';
import { Orders } from 'src/domain/orders.entity';
import { WarehouseId } from 'src/domain/warehouseId.entity';
import { WarehouseState } from 'src/domain/warehouseState.entity';
import { DataMapper } from 'src/infrastructure/mappers/dataMapper';
import { OrderId } from 'src/domain/orderId.entity';
import { OrderItemDetail } from 'src/domain/orderItemDetail.entity';
import { OrderItem } from 'src/domain/orderItem.entity';
import { ItemId } from 'src/domain/itemId.entity';
import { OrderState } from 'src/domain/orderState.enum';

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
            handleWarehouseState: jest.fn(),
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
      const order = new InternalOrder(new OrderId('I1'),[new OrderItemDetail(new OrderItem(new ItemId(2), 3),0,0),new OrderItemDetail(new OrderItem(new ItemId(4), 21),0,0)],OrderState.PROCESSING,new Date(),2,1);
      jest.spyOn(DataMapper, 'internalOrderToDTO').mockResolvedValue({} as any);

      await adapter.createInternalOrder(order);

      expect(DataMapper.internalOrderToDTO).toHaveBeenCalledWith(order);
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
  });

  describe('RequestDistanceWarehouse', () => {
    it('should call handler, map to DTO, and return DTO array', async () => {
      const whId = new WarehouseId(1);
      const domainStates = [new WarehouseState('ACTIVE', whId)];
      jest.spyOn(handler, 'handleWarehouseDistance').mockResolvedValue(domainStates);
      jest.spyOn(DataMapper, 'warehouseStatetoDto').mockReturnValue({} as any);
      jest.spyOn(DataMapper, 'warehouseIdToDto').mockReturnValue({} as any);

      const result = await adapter.RequestDistanceWarehouse(whId);

      expect(handler.handleWarehouseDistance).toHaveBeenCalled();
      expect(result.length).toBe(domainStates.length);
    });
  });

  describe('RequestWarehouseState', () => {
    it('should call centralSystemHandler.handleWarehouseState', async () => {
      const whId = new WarehouseId(1);
      jest.spyOn(DataMapper, 'warehouseIdToDto').mockReturnValue({} as any);

      await adapter.RequestWarehouseState(whId);

      expect(handler.handleWarehouseState).toHaveBeenCalled();
    });
  });
});
