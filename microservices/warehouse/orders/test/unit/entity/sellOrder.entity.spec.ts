import { SellOrder } from 'src/domain/sellOrder.entity';
import { OrderId } from 'src/domain/orderId.entity';
import { OrderItemDetail } from 'src/domain/orderItemDetail.entity';
import { OrderItem } from 'src/domain/orderItem.entity';
import { ItemId } from 'src/domain/itemId.entity';
import { OrderState } from 'src/domain/orderState.enum';

describe('SellOrder Entity', () => {
  let orderItem: OrderItem;
  let orderItemDetail: OrderItemDetail;
  let sellOrder: SellOrder;

  beforeEach(() => {
    orderItem = new OrderItem(new ItemId(1), 5);
    orderItemDetail = new OrderItemDetail(orderItem, 2, 100);
    sellOrder = new SellOrder(
      new OrderId('S933dcc2d-6637-4120-b80c-199f18e0ff2b'),
      [orderItemDetail],
      OrderState.PENDING,
      new Date('2025-09-02'),
      1,
      'Via Roma 1'
    );
  });

  it('should return correct destination address', () => {
    expect(sellOrder.getDestinationAddress()).toBe('Via Roma 1');
  });

  it('should update the destination address', () => {
    sellOrder.setDestinationAddress('Via Milano 2');
    expect(sellOrder.getDestinationAddress()).toBe('Via Milano 2');
  });

  it('should return the correct orderId', () => {
    expect(sellOrder.getOrderId()).toBe('S933dcc2d-6637-4120-b80c-199f18e0ff2b');
  });

  it('should return the correct items', () => {
    expect(sellOrder.getItemsDetail()).toEqual([orderItemDetail]);
  });

  it('should return the correct order state', () => {
    expect(sellOrder.getOrderState()).toBe(OrderState.PENDING);
  });

  it('should return the correct creation date', () => {
    expect(sellOrder.getCreationDate()).toEqual(new Date('2025-09-02'));
  });

  it('should return the correct warehouse departure', () => {
    expect(sellOrder.getWarehouseDeparture()).toBe(1);
  });
});
