import { Test, TestingModule } from '@nestjs/testing';
import { centralSystemHandler } from 'src/interfaces/centralSystem.handler';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';
import { InternalOrderDTO } from 'src/interfaces/http/dto/internalOrder.dto';
import { warehouseIdDto } from 'src/interfaces/http/dto/warehouseId.dto';
import { Inventory } from 'src/domain/inventory.entity';
import { Orders } from 'src/domain/orders.entity';
import { WarehouseState } from 'src/domain/warehouseState.entity';
import { OrderIdDTO } from 'src/interfaces/http/dto/orderId.dto';
import { OrderStateDTO } from 'src/interfaces/http/dto/orderState.dto';
import { OrderState } from 'src/domain/orderState.enum';

describe('centralSystemHandler', () => {
  let handler: centralSystemHandler;
  let natsClient: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        centralSystemHandler,
        {
          provide: 'NATS_SERVICE',
          useValue: {
            connect: jest.fn(),
            emit: jest.fn(),
            send: jest.fn()
          },
        },
      ],
    }).compile();

    handler = module.get<centralSystemHandler>(centralSystemHandler);
    natsClient = module.get<ClientProxy>('NATS_SERVICE');
  });

  it('should connect on module init', async () => {
    await handler.onModuleInit();
    expect(natsClient.connect).toHaveBeenCalled();
  });

  it('should emit notification', async () => {
    const msg = 'Test notification';
    await handler.handleNotification(msg);
    expect(natsClient.emit).toHaveBeenCalledWith('notification.send', { message: msg });
  });

  it('should emit internal order', async () => {
    let orId = new OrderIdDTO();
    orId.id = "I1";
    let orState = new OrderStateDTO();
    orState.orderState = OrderState.PENDING;
    const order: InternalOrderDTO = {orderId: orId, items: [],orderState: orState, creationDate: new Date(),warehouseDeparture: 1,warehouseDestination: 2};
    await handler.handleOrder(order);
    expect(natsClient.emit).toHaveBeenCalledWith('call.warehouse.'+order.warehouseDeparture+'.order.internal.new', order);
  });

  it('should send cloud inventory request and return Inventory', async () => {
    const mockInventory = new Inventory([]);
    (natsClient.send as jest.Mock).mockReturnValue(of(mockInventory));
    const result = await handler.handleCloudInventoryRequest();
    expect(natsClient.send).toHaveBeenCalledWith('cloud.inventory.request', {});
    expect(result).toBe(mockInventory);
  });

  it('should send cloud orders request and return Orders', async () => {
    const mockOrders = new Orders([], []);
    (natsClient.send as jest.Mock).mockReturnValue(of(mockOrders));
    const result = await handler.handleCloudOrdersRequest();
    expect(natsClient.send).toHaveBeenCalledWith('get.aggregate.orders', {});
    expect(result).toBe(mockOrders);
  });

  it('should request warehouse distance and return WarehouseState[]', async () => {
    const warehouseId = new warehouseIdDto();
    warehouseId.warehouseId = 1;
    const mockStates = [new WarehouseState('ACTIVE', { getId: () => 1 } as any)];
    (natsClient.send as jest.Mock).mockReturnValue(of(mockStates));
    const result = await handler.handleWarehouseDistance(warehouseId);
    expect(natsClient.send).toHaveBeenCalledWith('warehouse.distance.request', warehouseId);
    expect(result).toBe(mockStates);
  });
});
