import { OutboundEventAdapter } from '../../src/infrastructure/adapters/outbound-event.adapter';
import { OutboundEventHandler } from '../../src/interfaces/outboundEventHandler';
import { Product } from '../../src/domain/product.entity';
import { ProductId } from '../../src/domain/productId.entity';
import { WarehouseId } from '../../src/domain/warehouseId.entity';
import { OrderId } from '../../src/domain/orderId.entity';
import { ProductQuantity } from '../../src/domain/productQuantity.entity';
import { ProductQuantityArrayDto } from 'src/interfaces/dto/productQuantityArray.dto';

describe('OutboundEventAdapter', () => {
  let adapter: OutboundEventAdapter;
  let handler: jest.Mocked<OutboundEventHandler>;

  beforeEach(() => {
    handler = {
      handlerBelowMinThres: jest.fn(),
      handlerStockAdded: jest.fn(),
      handlerStockRemoved: jest.fn(),
      handlerStockUpdated: jest.fn(),
      handlerSufficientProductAvailability: jest.fn(),
      handlerReservetionQuantities: jest.fn(),
      handlerStockShipped: jest.fn(),
      handlerStockReceived: jest.fn(),
    } as unknown as jest.Mocked<OutboundEventHandler>;

    adapter = new OutboundEventAdapter(handler);
  });

  it('should call handlerBelowMinThres on belowMinThres', async () => {
    const product = new Product(new ProductId('p1'), 'Test', 100, 5, 0, 1, 10);
    const warehouse = new WarehouseId(1);
    await adapter.belowMinThres(product, warehouse);
    expect(handler.handlerBelowMinThres).toHaveBeenCalled();
  });

  it('should call handlerStockAdded on stockAdded', async () => {
    const product = new Product(new ProductId('p1'), 'Test', 100, 5, 0, 1, 10);
    const warehouse = new WarehouseId(1);
    await adapter.stockAdded(product, warehouse);
    expect(handler.handlerStockAdded).toHaveBeenCalled();
  });

  it('should call handlerStockRemoved on stockRemoved', async () => {
    const productId = new ProductId('p1');
    const warehouse = new WarehouseId(1);
    await adapter.stockRemoved(productId, warehouse);
    expect(handler.handlerStockRemoved).toHaveBeenCalled();
  });

  it('should call handlerStockUpdated on stockUpdated', async () => {
    const product = new Product(new ProductId('p1'), 'Test', 100, 5, 0, 1, 10);
    const warehouse = new WarehouseId(1);
    await adapter.stockUpdated(product, warehouse);
    expect(handler.handlerStockUpdated).toHaveBeenCalled();
  });

  it('should call handlerSufficientProductAvailability', async () => {
    const order = new OrderId('o1');
    await adapter.sufficientProductAvailability(order);
    expect(handler.handlerSufficientProductAvailability).toHaveBeenCalled();
  });

  it('should call handlerReservetionQuantities', async () => {
    const order = new OrderId('o1');
    const products = [new ProductQuantity(new ProductId('p1'), 5)];
    await adapter.reservedQuantities(order, products);
    expect(handler.handlerReservetionQuantities).toHaveBeenCalled();
  });

  it('should call handlerStockShipped', async () => {
    const order = new OrderId('o1');
    await adapter.stockShipped(order);
    expect(handler.handlerStockShipped).toHaveBeenCalled();
  });

  it('should call handlerStockReceived', async () => {
    const order = new OrderId('o1');
    await adapter.stockReceived(order);
    expect(handler.handlerStockReceived).toHaveBeenCalled();
  });
});
