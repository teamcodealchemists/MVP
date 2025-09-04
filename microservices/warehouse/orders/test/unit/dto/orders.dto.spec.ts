import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { OrdersDTO } from 'src/interfaces/dto/orders.dto';
import { SellOrderDTO } from 'src/interfaces/dto/sellOrder.dto';
import { InternalOrderDTO } from 'src/interfaces/dto/internalOrder.dto';

describe('OrdersDTO Validation', () => {
it('should validate a correct OrdersDTO', async () => {
  const dtoPlain = {
    sellOrders: [
      {
        orderId: { id: 'S933dcc2d-6637-4120-b80c-199f18e0ff2b' },
        items: [],
        orderState: { orderState: 'PENDING' },
        creationDate: new Date(),
        warehouseDeparture: 1,
        destinationAddress: 'Via Padova, 12',
      }
    ],
    internalOrders: [
      {
        orderId: { id: 'I933dcc2d-6637-4120-b80c-199f18e0ff2b' },
        items: [],
        orderState: { orderState: 'PENDING' },
        creationDate: new Date(),
        warehouseDeparture: 1,
        warehouseDestination: 2,
      }
    ],
  };

  // Converti prima gli oggetti interni
  const sellOrders = dtoPlain.sellOrders.map(item => 
    plainToInstance(SellOrderDTO, item)
  );
  const internalOrders = dtoPlain.internalOrders.map(item => 
    plainToInstance(InternalOrderDTO, item)
  );

  const dto = plainToInstance(OrdersDTO, {
    sellOrders,
    internalOrders
  });

  const errors = await validate(dto, { 
    forbidUnknownValues: true,
    whitelist: true 
  });

  // Debug degli errori
  if (errors.length > 0) {
    errors.forEach(error => {
      console.log(`Field: ${error.property}`);
      console.log(`Constraints: ${JSON.stringify(error.constraints)}`);
      if (error.children && error.children.length > 0) {
        error.children.forEach(child => {
          console.log(`  Child: ${child.property}`);
          console.log(`  Constraints: ${JSON.stringify(child.constraints)}`);
        });
      }
    });
  }

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
