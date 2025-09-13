import { Test, TestingModule } from '@nestjs/testing';
import { centralSystemHandler } from 'src/interfaces/centralSystem.handler';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';
import { InternalOrderDTO } from 'src/interfaces/http/dto/internalOrder.dto';
import { warehouseIdDto } from 'src/interfaces/http/dto/warehouseId.dto';
import { Inventory } from 'src/domain/inventory.entity';
import { Orders } from 'src/domain/orders.entity';
import { WarehouseId } from 'src/domain/warehouseId.entity';
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
    let sellOrId = new OrderIdDTO();
    sellOrId.id = "";
    const order: InternalOrderDTO = {orderId: orId, items: [],orderState: orState, creationDate: new Date(),warehouseDeparture: 1,warehouseDestination: 2, sellOrderId : sellOrId};
    await handler.handleOrder(order);
    expect(natsClient.emit).toHaveBeenCalledWith(
      'event.warehouse.' + order.warehouseDeparture + '.order.internal.new',
      JSON.stringify(order)
    );
  });

  it('should send cloud inventory request and return Inventory', async () => {
    const mockInventory = new Inventory([]);
    (natsClient.send as jest.Mock).mockReturnValue(of(JSON.stringify(mockInventory)));
    const result = await handler.handleCloudInventoryRequest();
    expect(natsClient.send).toHaveBeenCalledWith('aggregatedWarehouses.inventory', JSON.stringify({}));
    // Puoi aggiungere un controllo più specifico se DataMapper è mockato
    expect(result).toBeInstanceOf(Inventory);
  });

  it('should send cloud orders request and return Orders or null', async () => {
    const mockOrders = { result: { collection: [] } };
    (natsClient.send as jest.Mock).mockReturnValue(of(JSON.stringify(mockOrders)));
    const result = await handler.handleCloudOrdersRequest();
    expect(natsClient.send).toHaveBeenCalledWith('get.aggregate.orders.centralized', JSON.stringify({}));
    expect(result).toBeNull();
  });

  it('should request warehouse distance and return WarehouseId[]', async () => {
    const warehouseId = new warehouseIdDto();
    warehouseId.warehouseId = 1;
    const mockResponse = { result: { warehouses: [{ id: 1 }, { id: 2 }] } };
    (natsClient.send as jest.Mock).mockReturnValue(of(JSON.stringify(mockResponse)));
    const result = await handler.handleWarehouseDistance(warehouseId);
    const topic = `call.routing.warehouse.${warehouseId.warehouseId}.receiveRequest.set`;
    expect(natsClient.send).toHaveBeenCalledWith(topic, JSON.stringify(warehouseId));
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    expect(result[0]).toBeInstanceOf(WarehouseId);
  });
});
