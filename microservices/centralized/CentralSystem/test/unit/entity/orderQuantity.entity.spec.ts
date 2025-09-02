import { OrderQuantity } from 'src/domain/orderQuantity.entity';
import { OrderId } from 'src/domain/orderId.entity';
import { OrderItem } from 'src/domain/orderItem.entity';
import { ItemId } from 'src/domain/itemId.entity';

describe('OrderQuantity Entity', () => {
  let orderId: OrderId;
  let items: OrderItem[];
  let orderQuantity: OrderQuantity;

  beforeEach(() => {
    orderId = new OrderId('I17823131574457569');
    items = [new OrderItem(new ItemId(1), 5), new OrderItem(new ItemId(2), 10)];
    orderQuantity = new OrderQuantity(orderId, items);
  });

  it('should return the correct items', () => {
    expect(orderQuantity.getItemId()).toBe(items);
  });

  it('should return the correct quantities', () => {
    expect(orderQuantity.getQuantity()).toEqual([5, 10]);
  });

  it('should update quantity for a specific item', () => {
    orderQuantity.setQuantity(0, 7);
    expect(orderQuantity.getQuantity()[0]).toBe(7);
  });

  it('should return the correct order id', () => {
    expect(orderQuantity.getId()).toBe('I17823131574457569');
  });

  it('should return the correct order type', () => {
    expect(orderQuantity.getOrderType()).toBe('I');
  });
});
