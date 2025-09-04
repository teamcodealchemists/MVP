import { Order } from 'src/domain/order.entity';
import { OrderId } from 'src/domain/orderId.entity';
import { OrderItemDetail } from 'src/domain/orderItemDetail.entity';
import { OrderState } from 'src/domain/orderState.enum';

class TestOrder extends Order {} // Classe concreta per test

describe('Order Entity', () => {
  let orderId: OrderId;
  let items: OrderItemDetail[];
  let order: TestOrder;
  let date: Date;

  beforeEach(() => {
    orderId = new OrderId('ORD123');
    items = [];
    date = new Date();
    order = new TestOrder(orderId, items, OrderState.PENDING, date, 1);
  });

  it('should return correct orderId', () => {
    expect(order.getOrderId()).toBe('ORD123');
  });

  it('should get and set items', () => {
    const newItems = [new OrderItemDetail(null as any, 0, 0)];
    order.setItemsDetail(newItems);
    expect(order.getItemsDetail()).toBe(newItems);
  });

  it('should get and set order state', () => {
    order.setOrderState(OrderState.PROCESSING);
    expect(order.getOrderState()).toBe(OrderState.PROCESSING);
  });

  it('should get and set creation date', () => {
    const newDate = new Date('2025-01-01');
    order.setCreationDate(newDate);
    expect(order.getCreationDate()).toBe(newDate);
  });

  it('should get and set warehouse departure', () => {
    order.setWarehouseDeparture(5);
    expect(order.getWarehouseDeparture()).toBe(5);
  });
});
