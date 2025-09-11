import { InboundEventController } from '../../src/interfaces/inboundEvent.controller';
import { InboundEventListener } from '../../src/infrastructure/adapters/inbound-event.adapter';
import { ProductQuantityDto } from '../../src/interfaces/dto/productQuantity.dto';
import { ProductQuantityArrayDto } from '../../src/interfaces/dto/productQuantityArray.dto';
import { OrderIdDTO } from '../../src/interfaces/dto/orderId.dto';
import { ProductIdDto } from '../../src/interfaces/dto/productId.dto';

describe('InboundEventController', () => {
  let controller: InboundEventController;
  let listener: jest.Mocked<InboundEventListener>;

  beforeEach(() => {
    listener = {
      addQuantity: jest.fn(),
      orderRequest: jest.fn(),
      shipOrderRequest: jest.fn(),
      receiveShipment: jest.fn(),
      unreserveStock: jest.fn(),
    } as any;

    controller = new InboundEventController(listener);
  });

  it('should call addQuantity when handleAddQuantity is invoked', async () => {
    const payload = JSON.stringify({ id: { id: 'p1' }, quantity: 5 });

    await controller.handleAddQuantity(payload);

    expect(listener.addQuantity).toHaveBeenCalledWith({
      productId: { id: 'p1' },
      quantity: 5,
    } as ProductQuantityDto);
  });

  it('should call orderRequest when handleOrderRequest is invoked', async () => {
    const payload = {
      orderIdDTO: { id: 'o1' },
      itemsDTO: [
        { itemId: { id: 'p1' }, quantity: 2 },
        { itemId: { id: 'p2' }, quantity: 3 },
      ],
    };

    await controller.handleOrderRequest(payload);

    const expectedDto = new ProductQuantityArrayDto();
    const orderDto = new OrderIdDTO();
    orderDto.id = 'o1';
    expectedDto.id = orderDto;
    expectedDto.productQuantityArray = [
      { productId: { id: 'p1' }, quantity: 2 },
      { productId: { id: 'p2' }, quantity: 3 },
    ];

    expect(listener.orderRequest).toHaveBeenCalledWith(expectedDto);
  });

  it('should call shipOrderRequest when handleShipOrderRequest is invoked', async () => {
    const payload = {
      orderIdDTO: { id: 'o1' },
      itemsDTO: [{ itemId: { id: 'p1' }, quantity: 2 }],
    };

    await controller.handleShipOrderRequest(payload);

    const expectedDto = new ProductQuantityArrayDto();
    const orderDto = new OrderIdDTO();
    orderDto.id = 'o1';
    expectedDto.id = orderDto;
    expectedDto.productQuantityArray = [{ productId: { id: 'p1' }, quantity: 2 }];

    expect(listener.shipOrderRequest).toHaveBeenCalledWith(expectedDto);
  });

  it('should call receiveShipment when handleReceiveShipment is invoked', async () => {
    const payload = {
      orderIdDTO: { id: 'o1' },
      itemsDTO: [{ itemId: { id: 'p1' }, quantity: 5 }],
    };

    await controller.handleReceiveShipment(payload);

    const expectedDto = new ProductQuantityArrayDto();
    const orderDto = new OrderIdDTO();
    orderDto.id = 'o1';
    expectedDto.id = orderDto;
    expectedDto.productQuantityArray = [{ productId: { id: 'p1' }, quantity: 5 }];

    expect(listener.receiveShipment).toHaveBeenCalledWith(expectedDto);
  });

  it('should call unreserveStock when unreserveStock is invoked', async () => {
    const payload = {
      orderIdDTO: { id: 'o1' },
      itemsDTO: [{ itemId: { id: 'p1' }, quantity: 5 }],
    };

    await controller.unreserveStock(payload);

    const expectedDto = new ProductQuantityArrayDto();
    const orderDto = new OrderIdDTO();
    orderDto.id = 'o1';
    expectedDto.id = orderDto;
    expectedDto.productQuantityArray = [{ productId: { id: 'p1' }, quantity: 5 }];

    expect(listener.unreserveStock).toHaveBeenCalledWith(expectedDto);
  });
});
