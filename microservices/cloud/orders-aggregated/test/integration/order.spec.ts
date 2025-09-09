import { Order } from '../../src/domain/syncOrder.entity';
import { OrderId } from '../../src/domain/syncOrderId.entity';
import { ItemId } from '../../src/domain/syncItemId.entity';
import { OrderItem } from '../../src/domain/syncOrderItem.entity';
import { OrderItemDetail } from '../../src/domain/syncOrderItemDetail.entity';

enum OrderState { PENDING = 'PENDING', SHIPPED = 'SHIPPED' }

// Implementazione concreta per test (Order è astratta)
class TestOrder extends Order {
  constructor(
    orderId: OrderId,
    items: OrderItemDetail[],
    orderState: OrderState,
    creationDate: Date,
    warehouseDeparture: number,
  ) {
    super(orderId, items, orderState as any, creationDate as any, warehouseDeparture);
  }
}

describe('Integration test tra classi Order, OrderItemDetail e OrderItem', () => {
  it('verifica consistenza tra Order e i suoi item', () => {
    const orderId = new OrderId('S-001');
    const itemId = new ItemId(2);
    const item = new OrderItem(itemId, 100);
    const detail = new OrderItemDetail(item, 20, 10);

    const order = new TestOrder(orderId, [detail], OrderState.PENDING, new Date(), 3);
    
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
    order.setOrderState(OrderState.SHIPPED);

    expect(order.getItemsDetail()[0].getQuantityReserved()).toBe(30);
    expect(order.getItemsDetail()[0].getUnitPrice()).toBe(23);
    expect(order.getOrderState()).toBe('SHIPPED');
  });
});