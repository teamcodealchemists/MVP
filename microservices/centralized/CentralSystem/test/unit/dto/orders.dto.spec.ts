import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { OrdersDTO } from 'src/interfaces/http/dto/orders.dto';
import { SellOrderDTO } from 'src/interfaces/http/dto/sellOrder.dto';
import { InternalOrderDTO } from 'src/interfaces/http/dto/internalOrder.dto';

describe('OrdersDTO Validation', () => {
  it('should validate a correct OrdersDTO', async () => {
    const dtoPlain = {
      sellOrders: [
        {
          orderId: { id: 'S123' },
          items: [],
          orderState: { orderState: 'PENDING' },
          creationDate: new Date(),
          warehouseDeparture: 1,
          destinationAddress: 'Address 1',
        } as SellOrderDTO
      ],
      internalOrders: [
        {
          orderId: { id: 'I123' },
          items: [],
          orderState: { orderState: 'PENDING' },
          creationDate: new Date(),
          warehouseDeparture: 1,
          warehouseDestination: 2,
        } as InternalOrderDTO
      ],
    };

    const dto = plainToInstance(OrdersDTO, dtoPlain);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should fail if sellOrders is not an array', async () => {
    const dtoPlain = {
      sellOrders: null,
      internalOrders: [],
    };

    const dto = plainToInstance(OrdersDTO, dtoPlain);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('sellOrders');
  });

  it('should fail if internalOrders is not an array', async () => {
    const dtoPlain = {
      sellOrders: [],
      internalOrders: null,
    };

    const dto = plainToInstance(OrdersDTO, dtoPlain);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('internalOrders');
  });
});
