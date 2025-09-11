import { Test, TestingModule } from '@nestjs/testing';
import { CentralSystemService } from '../../src/application/centralsystem.service';
import { OutboundPortsAdapter } from 'src/infrastructure/adapters/centralSystemEventAdapter';
import { Product } from 'src/domain/product.entity';
import { ProductId } from 'src/domain/productId.entity';
import { WarehouseId } from 'src/domain/warehouseId.entity';
import { OrderQuantity } from 'src/domain/orderQuantity.entity';
import { OrderItem } from 'src/domain/orderItem.entity';
import { InternalOrder } from 'src/domain/internalOrder.entity';
import { OrderItemDetail } from 'src/domain/orderItemDetail.entity';
import { ItemId } from 'src/domain/itemId.entity';
import { OrderId } from 'src/domain/orderId.entity';
import { WarehouseState } from 'src/domain/warehouseState.entity';
import { OrderState } from 'src/domain/orderState.enum';
import { SellOrder } from 'src/domain/sellOrder.entity';
import { Inventory } from 'src/domain/inventory.entity';
import { Orders } from 'src/domain/orders.entity';

describe('CentralSystemService', () => {
  let service: CentralSystemService;
  let outboundAdapter: OutboundPortsAdapter;
  let internalorder = new InternalOrder(new OrderId('I1'),[new OrderItemDetail(new OrderItem(new ItemId(2), 3),0,0),new OrderItemDetail(new OrderItem(new ItemId(4), 21),0,0)],OrderState.PROCESSING,new Date(),2,1);
  let sellorder = new SellOrder(new OrderId('S1'),[new OrderItemDetail(new OrderItem(new ItemId(2), 5),0,0)],OrderState.PENDING,new Date(),2,'Via Roma 1');
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CentralSystemService,
        {
          provide: OutboundPortsAdapter,
          useValue: {
            CloudInventoryRequest: jest.fn().mockResolvedValue({
              productList: [
                { id: '1', unitPrice: 10,quantity: 5, minThres: 10, maxThres: 200, warehouseId: { warehouseId: 1 }, name: 'Prodotto 1' },
                { id: '2', unitPrice: 15,quantity: 50, minThres: 5, maxThres: 100, warehouseId: { warehouseId: 2 }, name: 'Prodotto 2' },
                { id: '3', unitPrice: 20, quantity: 0, minThres: 5, maxThres: 100, warehouseId: { warehouseId: 1 }, name: 'Prodotto 3' }
              ]
            }),
            CloudOrderRequest: jest.fn().mockResolvedValue({
              internalOrders: [
                {
                  orderId: { id: 'I1' },
                  items: [{ item: { itemId: { id: 2 }, quantity: 3 }, quantityReserved: 0, unitPrice: 0 }],
                  orderState: { orderState: 'PROCESSING' },
                  creationDate: new Date().toISOString(),
                  warehouseDeparture: 2,
                  warehouseDestination: 1
                }
              ],
              sellOrders: [
                {
                  orderId: { id: 'S1' },
                  items: [{ item: { itemId: { id: 1 }, quantity: 5 }, quantityReserved: 0, unitPrice: 0 }],
                  orderState: { orderState: 'PENDING' },
                  creationDate: new Date().toISOString(),
                  warehouseDeparture: 1,
                  destinationAddress: 'Via Roma 1'
                }
              ]
            }),
            // MODIFICA: restituisci DTO invece che entity!
            RequestDistanceWarehouse: jest.fn().mockResolvedValue([
              { warehouseId: 2 },
              { warehouseId: 1 },
            ]),
            createInternalOrder: jest.fn(),
            SendNotification: jest.fn(),
            sendOrder: jest.fn(),
            sendInventory: jest.fn(),
          }
        }
      ]
    }).compile();

    service = module.get<CentralSystemService>(CentralSystemService);
    outboundAdapter = module.get<OutboundPortsAdapter>(OutboundPortsAdapter);
    jest.spyOn(service, 'RequestAllNeededData').mockResolvedValue({
      inv: new Inventory([
        new Product(
          new ProductId('1'),
          'Prodotto 1',
          10,
          5,
          10,
          200,
          new WarehouseId(1)
        ),
        new Product(
          new ProductId('1'),
          'Prodotto 1',
          15,
          50,
          5,
          100,
          new WarehouseId(2)
        ),
        // MODIFICA: quantità abbassata a 4 per far fallire il test residualQty < minThres
        new Product(
          new ProductId('2'),
          'Prodotto 2',
          15,
          4,
          5,
          100,
          new WarehouseId(2)
        ),
        new Product(
          new ProductId('4'),
          'Prodotto 2',
          15,
          60,
          5,
          100,
          new WarehouseId(1)
        )
      ]),
      order: new Orders([internalorder],[sellorder]),
      dist: [
        new WarehouseId(2),
        new WarehouseId(1)
      ]
    });
  });

  describe('ManageCriticalMinThres', () => {
    it('should create internal order if residual quantity >= minThres', async () => {
      const product = new Product(new ProductId("1"), 'Prodotto 1', 5, 10, 200, 10, new WarehouseId(1));
      await service.ManageCriticalMinThres(product);
      expect(outboundAdapter.createInternalOrder).toHaveBeenCalled();
    });

    it('should not create internal order if residual availableQty < productInInv.getMinThres()', async () => {
      const product = new Product(new ProductId("2"), 'Prodotto 2', 15, 5, 10, 100, new WarehouseId(1));
      await service.ManageCriticalMinThres(product);
      expect(outboundAdapter.createInternalOrder).not.toHaveBeenCalled();
    });

    it('should not create internal order if residual residualQty < productInInv.getMinThres()', async () => {
      const product = new Product(new ProductId("2"), 'Prodotto 2', 15, 1, 10, 100, new WarehouseId(1));
      await service.ManageCriticalMinThres(product);
      expect(outboundAdapter.createInternalOrder).not.toHaveBeenCalled();
    });

    it('should not create internal order if product not in inventory', async () => {
      const product = new Product(new ProductId("999"), 'Non Esistente', 10, 1, 5, 50, new WarehouseId(1));
      await service.ManageCriticalMinThres(product);
      expect(outboundAdapter.createInternalOrder).not.toHaveBeenCalled();
    });
  });

  describe('CheckInsufficientQuantity', () => {
    it('should create internal orders if products have sufficient quantity', async () => {
      const orderItem = new OrderItem(new ItemId(1), 5);
      const orderQuantity = new OrderQuantity( new OrderId("1") , [orderItem]);
      await service.CheckInsufficientQuantity(orderQuantity, new WarehouseId(1));
      expect(outboundAdapter.createInternalOrder).toHaveBeenCalled();
    });

    it('Non dovrebbe creare un ordine interno quando non ci sono magazzini con abbastanza prodotti, caso : availableQty < productInInv.getMinThres()', async () => {
      const orderItem = new OrderItem(new ItemId(2), 10);
      const orderQuantity = new OrderQuantity(new OrderId("1"), [orderItem] );
      await service.CheckInsufficientQuantity(orderQuantity, new WarehouseId(1));
      expect(outboundAdapter.createInternalOrder).not.toHaveBeenCalled();
    });

    it('Non dovrebbe creare un ordine interno quando non ci sono magazzini con abbastanza prodotti, caso : residualQty < productInInv.getMinThres()', async () => {
      const orderItem = new OrderItem(new ItemId(2), 1);
      const orderQuantity = new OrderQuantity(new OrderId("1"), [orderItem] );
      await service.CheckInsufficientQuantity(orderQuantity, new WarehouseId(1));
      expect(outboundAdapter.createInternalOrder).not.toHaveBeenCalled();
    });

    it('Non dovrebbe creare un ordine interno perchè nei magazzini non vi è presente il prodotto richiesto', async () => {
      const orderItem = new OrderItem(new ItemId(90), 1);
      const orderQuantity = new OrderQuantity(new OrderId("1"), [orderItem] );
      await service.CheckInsufficientQuantity(orderQuantity, new WarehouseId(1));
      expect(outboundAdapter.createInternalOrder).not.toHaveBeenCalled();
    });
  });

  describe('CheckWarehouseState', () => {
    it('should send notification for inactive warehouses', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      await service.CheckWarehouseState([new WarehouseState('INACTIVE',new WarehouseId(1))]);
      expect(outboundAdapter.SendNotification).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should do nothing if all warehouses are active', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      await service.CheckWarehouseState([new WarehouseState('ACTIVE',new WarehouseId(1))]);
      expect(outboundAdapter.SendNotification).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle empty warehouseStates array', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      await service.CheckWarehouseState([]);
      expect(outboundAdapter.SendNotification).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('ManageOverMaxThres', () => {
    it('should create internal order if residual quantity <= maxThres', async () => {
      const product = new Product(new ProductId("4"), 'Prodotto 2', 10, 10, 5, 100, new WarehouseId(2));
      await service.ManageOverMaxThres(product);
      expect(outboundAdapter.createInternalOrder).toHaveBeenCalled();
    });

    it('should not create internal order if residual availableQty > maxThres', async () => {
      const product = new Product(new ProductId("4"), 'Prodotto 1', 41, 41, 10, 100, new WarehouseId(2));
      await service.ManageOverMaxThres(product);
      expect(outboundAdapter.createInternalOrder).not.toHaveBeenCalled();
    });

    it('should not create internal order if residual residualQty  > maxThres', async () => {
      const product = new Product(new ProductId("4"), 'Prodotto 1', 20, 20, 10, 100, new WarehouseId(2));
      await service.ManageOverMaxThres(product);
      expect(outboundAdapter.createInternalOrder).not.toHaveBeenCalled();
    });

    it('Non dovrebbe creare un ordine interno perchè nei magazzini non vi è presente il prodotto richiesto', async () => {
      const product = new Product(new ProductId("100"), 'Prodotto 1', 10, 300, 10, 100, new WarehouseId(2));
      await service.ManageOverMaxThres(product);
      expect(outboundAdapter.createInternalOrder).not.toHaveBeenCalled();
    });
  });

  describe('RequestAllNeededData', () => {
    it('should fetch inventory, orders and warehouse states and map them to domain', async () => {
      jest.restoreAllMocks();
      const spyInv = jest.spyOn(outboundAdapter, 'CloudInventoryRequest');
      const spyOrder = jest.spyOn(outboundAdapter, 'CloudOrderRequest');
      const spyDist = jest.spyOn(outboundAdapter, 'RequestDistanceWarehouse');
      const warehouseId = new WarehouseId(1);
      const result = await service.RequestAllNeededData(warehouseId);
      expect(spyInv).toHaveBeenCalled();
      expect(spyOrder).toHaveBeenCalled();
      expect(spyDist).toHaveBeenCalledWith(warehouseId);
      expect(result).toHaveProperty('inv');
      expect(result).toHaveProperty('order');
      expect(result).toHaveProperty('dist');
      expect(Array.isArray(result.dist)).toBe(true);
    });
  });
});
