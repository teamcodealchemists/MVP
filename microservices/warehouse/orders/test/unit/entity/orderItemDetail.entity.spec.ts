import { OrderItemDetail } from 'src/domain/orderItemDetail.entity';
import { OrderItem } from 'src/domain/orderItem.entity';
import { ItemId } from 'src/domain/itemId.entity';

describe('OrderItemDetail Entity', () => {
  let orderItem: OrderItem;
  let orderItemDetail: OrderItemDetail;

  beforeEach(() => {
    orderItem = new OrderItem(new ItemId(1), 5);
    orderItemDetail = new OrderItemDetail(orderItem, 2, 100);
  });

  it('should return the correct OrderItem', () => {
    expect(orderItemDetail.getItem()).toBe(orderItem);
  });

  it('should return the correct quantityReserved', () => {
    expect(orderItemDetail.getQuantityReserved()).toBe(2);
  });

  it('should return the correct unitPrice', () => {
    expect(orderItemDetail.getUnitPrice()).toBe(100);
  });

  it('should update the quantityReserved', () => {
    orderItemDetail.setQuantityReserved(10);
    expect(orderItemDetail.getQuantityReserved()).toBe(10);
  });

  it('should update the unitPrice', () => {
    orderItemDetail.setUnitPrice(200);
    expect(orderItemDetail.getUnitPrice()).toBe(200);
  });
});