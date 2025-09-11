import { Orders } from '../../../src/domain/orders.entity';
import { SellOrder } from '../../../src/domain/sellOrder.entity';
import { InternalOrder } from '../../../src/domain/internalOrder.entity';
import { OrderId } from '../../../src/domain/orderId.entity';
import { OrderItemDetail } from '../../../src/domain/orderItemDetail.entity';
import { OrderState } from '../../../src/domain/orderState.enum';

describe('Orders Entity - set methods', () => {
  let orders: Orders;
  let initialInternalOrders: InternalOrder[];
  let initialSellOrders: SellOrder[];

  beforeEach(() => {
    // Mock data
    const orderId = new OrderId('S2108305810812');
    const itemDetail = new OrderItemDetail({} as any, 10, 100);

    const sellOrder = new SellOrder(
      orderId,
      [itemDetail],
      OrderState.PENDING,
      new Date(),
      1,
      'Test Address',
    );

    const internalOrder = new InternalOrder(
      new OrderId('I12301250810284105'),
      [itemDetail],
      OrderState.PENDING,
      new Date(),
      2,
      1,
      new OrderId('S45601250810284105'),
    );

    initialSellOrders = [sellOrder];
    initialInternalOrders = [internalOrder];

    orders = new Orders(initialSellOrders, initialInternalOrders);
  });

  it('should update sellOrders when setSellOrders is called', () => {
    const newSellOrders: SellOrder[] = [
      new SellOrder(
        new OrderId('S2108305810812'),
        [],
        OrderState.PENDING,
        new Date(),
        3,
        'New Address',
      ),
    ];

    orders.setSellOrders(newSellOrders);

    expect(orders.getSellOrders()).toEqual(newSellOrders);
    expect(orders.getSellOrders()).not.toEqual(initialSellOrders);
  });

  it('should update internalOrders when setInternalOrders is called', () => {
    const newInternalOrders: InternalOrder[] = [
      new InternalOrder(
        new OrderId('I12301250810284105'),
        [],
        OrderState.PENDING,
        new Date(),
        4,
        2,
        new OrderId('S45601250810284105')
      ),
    ];

    orders.setInternalOrders(newInternalOrders);

    expect(orders.getInternalOrders()).toEqual(newInternalOrders);
    expect(orders.getInternalOrders()).not.toEqual(initialInternalOrders);
  });
});
