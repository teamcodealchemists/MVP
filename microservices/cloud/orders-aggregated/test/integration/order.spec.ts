import { SyncOrder } from '../../src/domain/syncOrder.entity';
import { SyncOrderId } from '../../src/domain/syncOrderId.entity';
import { SyncItemId } from '../../src/domain/syncItemId.entity';
import { SyncOrderItem } from '../../src/domain/syncOrderItem.entity';
import { SyncOrderItemDetail } from '../../src/domain/syncOrderItemDetail.entity';

enum SyncOrderState { PENDING = 'PENDING', SHIPPED = 'SHIPPED' }

// Implementazione concreta per test (Order è astratta)
class TestOrder extends SyncOrder {
  constructor(
    orderId: SyncOrderId,
    items: SyncOrderItemDetail[],
    orderState: SyncOrderState,
    creationDate: Date,
    warehouseDeparture: number,
  ) {
    super(orderId, items, orderState as any, creationDate as any, warehouseDeparture);
  }
}

describe('Integration test tra classi Order, OrderItemDetail e OrderItem', () => {
  it('verifica consistenza tra Order e i suoi item', () => {
    const orderId = new SyncOrderId('S-001');
    const itemId = new SyncItemId(2);
    const item = new SyncOrderItem(itemId, 100);
    const detail = new SyncOrderItemDetail(item, 20, 10);

    const order = new TestOrder(orderId, [detail], SyncOrderState.PENDING, new Date(), 3);
    
    // Testiamo la catena di integrazione
    // Per testare i get
    expect(order.getOrderId()).toBe('S-001');
    expect(order.getItemsDetail()[0].getItem().getQuantity()).toBe(100);
    expect(order.getItemsDetail()[0].getQuantityReserved()).toBe(20);
    expect(order.getItemsDetail()[0].getUnitPrice()).toBe(10);
    expect(order.getOrderState()).toBe('PENDING');

    // Per testare i set
    order.getItemsDetail()[0].setQuantityReserved(30);
    order.getItemsDetail()[0].setUnitPrice(23);
    order.setOrderState(SyncOrderState.SHIPPED);

    expect(order.getItemsDetail()[0].getQuantityReserved()).toBe(30);
    expect(order.getItemsDetail()[0].getUnitPrice()).toBe(23);
    expect(order.getOrderState()).toBe('SHIPPED');
  });
});