import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { SellOrderDTO } from 'src/interfaces/dto/sellOrder.dto';
import { OrderIdDTO } from 'src/interfaces/dto/orderId.dto';
import { OrderItemDetailDTO } from 'src/interfaces/dto/orderItemDetail.dto';
import { OrderStateDTO } from 'src/interfaces/dto/orderState.dto';

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

  it("should fail if orderState is not a valid OrderState", async () => {
    const dto = new SellOrderDTO();
    dto.orderId = { id: "I7f4837d0-246a-4c75-8589-dfe5f7f4c52a" } as OrderIdDTO;
    dto.items = [{ item: { itemId: { id: 1}, quantity: 5 }, quantityReserved: 5, unitPrice: 29.99 }] as OrderItemDetailDTO[];
    dto.orderState = { orderState: "INVALID_STATE" } as OrderStateDTO; // Stato non valido
    dto.creationDate = new Date();
    dto.warehouseDeparture = 1;
    dto.destinationAddress = 'Via Roma, 10';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    
    // Verifica che ci sia un errore per orderState
    const orderStateErrors = errors.filter(e => e.property === 'orderState');
    expect(orderStateErrors.length).toBeGreaterThan(0);
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

   it("should fail if warehouseDeparture is not an int", async () => {
    const dto = new SellOrderDTO();
    dto.orderId = { id: "I7f4837d0-246a-4c75-8589-dfe5f7f4c52a" } as OrderIdDTO;
    dto.items = [{ item: { itemId: { id: 1}, quantity: 5 }, quantityReserved: 5, unitPrice: 29.99 }] as OrderItemDetailDTO[];
    dto.orderState = { orderState: "PENDING" } as OrderStateDTO;
    dto.creationDate = new Date();
    dto.warehouseDeparture = 1.5 as any; // not an int
    dto.destinationAddress = '';
  
    const errors = await validate(dto);
    expect(errors.some(e => e.property === "warehouseDeparture")).toBe(true);
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
