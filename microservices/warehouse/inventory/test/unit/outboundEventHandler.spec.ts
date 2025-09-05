import { Test, TestingModule } from '@nestjs/testing';
import { OutboundEventHandler } from '../../src/interfaces/outboundEventHandler';
import { ClientProxy } from '@nestjs/microservices';
import { ProductDto } from '../../src/interfaces/dto/product.dto';
import { ProductIdDto } from '../../src/interfaces/dto/productId.dto';
import { WarehouseIdDto } from '../../src/interfaces/dto/warehouseId.dto';
import { OrderIdDTO } from '../../src/interfaces/dto/orderId.dto';
import { ProductQuantityArrayDto } from '../../src/interfaces/dto/productQuantityArray.dto';

describe('OutboundEventHandler', () => {
  let handler: OutboundEventHandler;
  let natsClient: jest.Mocked<ClientProxy>;

  beforeEach(async () => {
    const mockClient = {
      connect: jest.fn(),
      emit: jest.fn(),
    } as unknown as jest.Mocked<ClientProxy>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OutboundEventHandler,
        { provide: 'NATS_SERVICE', useValue: mockClient },
      ],
    }).compile();

    handler = module.get<OutboundEventHandler>(OutboundEventHandler);
    natsClient = module.get<ClientProxy>('NATS_SERVICE') as jest.Mocked<ClientProxy>;
  });

  it('should connect on module init', async () => {
    await handler.onModuleInit();
    expect(natsClient.connect).toHaveBeenCalled();
  });

  it('should emit belowMinThres event', async () => {
    const product: ProductDto = { id: { id: 'p1' }, name: 'Prod', unitPrice: 10, quantity: 5, quantityReserved: 0, minThres: 1, maxThres: 10, warehouseId: { warehouseId: 1 } };
    await handler.handlerBelowMinThres(product);
    expect(natsClient.emit).toHaveBeenCalledWith('inventory.belowMinThres', { product });
  });

  it('should emit aboveMaxThres event', async () => {
    const product: ProductDto = { id: { id: 'p2' }, name: 'Prod2', unitPrice: 15, quantity: 20, quantityReserved: 0, minThres: 1, maxThres: 10, warehouseId: { warehouseId: 1 } };
    await handler.handlerAboveMaxThres(product);
    expect(natsClient.emit).toHaveBeenCalledWith('inventory.aboveMaxThres', { product });
  });

  it('should emit stockAdded event', async () => {
    const product: ProductDto = { id: { id: 'p3' }, name: 'Prod3', unitPrice: 20, quantity: 8, quantityReserved: 0, minThres: 2, maxThres: 15, warehouseId: { warehouseId: 1 } };
    await handler.handlerStockAdded(product);
    expect(natsClient.emit).toHaveBeenCalledWith('inventory.stockAdded', { product, warehouseId: product.warehouseId });
  });

  it('should emit stockRemoved event', async () => {
    const productId: ProductIdDto = { id: 'p4' };
    const warehouseId: WarehouseIdDto = { warehouseId: 1 };
    await handler.handlerStockRemoved(productId, warehouseId);
    expect(natsClient.emit).toHaveBeenCalledWith('inventory.stockRemoved', { productId, warehouseId });
  });

  it('should emit stockUpdated event', async () => {
    const product: ProductDto = { id: { id: 'p5' }, name: 'Prod5', unitPrice: 50, quantity: 5, quantityReserved: 0, minThres: 1, maxThres: 20, warehouseId: { warehouseId: 2 } };
    await handler.handlerStockUpdated(product);
    expect(natsClient.emit).toHaveBeenCalledWith('inventory.stockUpdated', { product, warehouseId: product.warehouseId });
  });

  it('should emit sufficientProductAvailability event', async () => {
    const orderId: OrderIdDTO = { id: 'order1' };
    await handler.handlerSufficientProductAvailability(orderId);
    expect(natsClient.emit).toHaveBeenCalledWith('inventory.sufficientAvailability', { orderId });
  });

  it('should emit reservetionQuantities event', async () => {
    const productQty: ProductQuantityArrayDto = { id: { id: 'order1' }, productQuantityArray: [{ productId: { id: 'p1' }, quantity: 5 }] };
    await handler.handlerReservetionQuantities(productQty);
    expect(natsClient.emit).toHaveBeenCalledWith('inventory.reservetionQuantities', { product: productQty });
  });

  it('should emit stockShipped event', async () => {
    const orderId: OrderIdDTO = { id: 'order2' };
    await handler.handlerStockShipped(orderId);
    expect(natsClient.emit).toHaveBeenCalledWith('inventory.stockShipped', { orderId });
  });

  it('should emit stockReceived event', async () => {
    const orderId: OrderIdDTO = { id: 'order3' };
    await handler.handlerStockReceived(orderId);
    expect(natsClient.emit).toHaveBeenCalledWith('inventory.stockReceived', { orderId });
  });
});
