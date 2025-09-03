import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { SellOrderDTO } from 'src/interfaces/http/dto/sellOrder.dto';
import { OrderIdDTO } from 'src/interfaces/http/dto/orderId.dto';
import { OrderItemDTO } from 'src/interfaces/http/dto/orderItem.dto';
import { OrderStateDTO } from 'src/interfaces/http/dto/orderState.dto';

describe('SellOrderDTO Validation', () => {
  it('should validate a correct SellOrderDTO', async () => {
    const dtoPlain = {
      orderId: { id: "I123" },
      items: [
        { itemId: { id: 1 }, quantity: 5, quantityReserved: 0, unitPrice: 100 }
      ],
      orderState: "PENDING",
      creationDate: new Date(),
      warehouseDeparture: 1,
      destinationAddress: 'Via Roma, 10',
    };

    const dto = plainToInstance(SellOrderDTO, dtoPlain);
    const errors = await validate(dto);
    console.log(errors);
    expect(errors.length).toBe(0);
  });

  it('should fail if items is not an array', async () => {
    const dtoPlain = {
      orderId: { id: "I123" },
      items: null,
      orderState: "PENDING",
      creationDate: new Date(),
      warehouseDeparture: 1,
      destinationAddress: 'Via Roma, 10',
    };

    const dto = plainToInstance(SellOrderDTO, dtoPlain);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('items');
  });

  it('should fail if destinationAddress is empty', async () => {
    const dtoPlain = {
      orderId: { id: "I123" },
      items: [
        { itemId: { id: 1 }, quantity: 5, quantityReserved: 0, unitPrice: 100 }
      ],
      orderState: "PENDING",
      creationDate: new Date(),
      warehouseDeparture: 1,
      destinationAddress: '',
    };

    const dto = plainToInstance(SellOrderDTO, dtoPlain);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    console.log(errors[0].property);
    expect(errors[0].property).toBe('destinationAddress');
  });
});
