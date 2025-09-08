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
          items: [{ 
            item: {
              itemId: { id: 1 }, 
              quantity: 5 
            }, 
            quantityReserved: 5, 
            unitPrice: 29.99 
          }],        
          orderState: { orderState: "PENDING" },
          creationDate: new Date(),
          warehouseDeparture: 1,
          destinationAddress: 'Via Padova, 12',
        }
      ],
      internalOrders: [
        {
          orderId: { id: 'I933dcc2d-6637-4120-b80c-199f18e0ff2b' },
          items: [{ 
            item: { 
              itemId: { id: 1 }, 
              quantity: 5 
            }, 
            quantityReserved: 5, 
            unitPrice: 29.99 
          }],
          orderState: { orderState: "PENDING" },
          creationDate: new Date(),
          warehouseDeparture: 1,
          warehouseDestination: 2,
        }
      ],
    };

    // Debug: valido ogni parte separatamente
    console.log('=== VALIDATING SELL ORDER ===');
    const sellOrder = plainToInstance(SellOrderDTO, dtoPlain.sellOrders[0]);
    const sellErrors = await validate(sellOrder);
    console.log('Sell order errors:', JSON.stringify(sellErrors, null, 2));

    console.log('=== VALIDATING INTERNAL ORDER ===');
    const internalOrder = plainToInstance(InternalOrderDTO, dtoPlain.internalOrders[0]);
    const internalErrors = await validate(internalOrder);
    console.log('Internal order errors:', JSON.stringify(internalErrors, null, 2));

    console.log('=== VALIDATING ORDERS DTO ===');
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
