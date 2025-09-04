import { InternalOrder } from 'src/domain/internalOrder.entity';
import { OrderId } from 'src/domain/orderId.entity';
import { OrderItemDetail } from 'src/domain/orderItemDetail.entity';
import { OrderItem } from 'src/domain/orderItem.entity';
import { OrderState } from 'src/domain/orderState.enum';

describe('InternalOrder Entity', () => {
  let internalOrder: InternalOrder;

  beforeEach(() => {
    const orderId = new OrderId('I1');
    const items = [
      new OrderItemDetail(new OrderItem({ itemId: 1 } as any, 2), 0, 100)
    ];
    internalOrder = new InternalOrder(
      orderId,
      items,
      OrderState.PENDING,
      new Date('2025-01-01T00:00:00Z'),
      1,     
      2       
    );
  });

  it('should correctly initialize properties', () => {
    expect(internalOrder.getOrderId()).toBe('I1');
    expect(internalOrder.getItemsDetail().length).toBe(1);
    expect(internalOrder.getOrderState()).toBe(OrderState.PENDING);
    expect(internalOrder.getWarehouseDeparture()).toBe(1);
    expect(internalOrder.getWarehouseDestination()).toBe(2);
  });

  it('should update warehouseDestination using setWarehouseDestination', () => {
    internalOrder.setWarehouseDestination(5);
    expect(internalOrder.getWarehouseDestination()).toBe(5);
  });

  it('should allow updating orderState', () => {
    internalOrder.setOrderState(OrderState.PROCESSING);
    expect(internalOrder.getOrderState()).toBe(OrderState.PROCESSING);
  });
});
