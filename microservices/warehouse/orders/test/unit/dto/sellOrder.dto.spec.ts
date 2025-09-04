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
      orderId: { id: "S9f4837d0-246a-4c75-8589-dfe5f7f4c52a" },
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
      destinationAddress: 'Via Roma, 10',
    };

    const dto = plainToInstance(SellOrderDTO, dtoPlain);
    const errors = await validate(dto);
    console.log(errors);
    expect(errors.length).toBe(0);
  });

  it("should fail if orderState is not a valid OrderState", async () => {
    const dtoPlain = {
      orderId: { id: "S9f4837d0-246a-4c75-8589-dfe5f7f4c52a" },
      items: [{ item: { itemId: { id: 1}, quantity: 5 }, quantityReserved: 5, unitPrice: 29.99 }] as OrderItemDetailDTO[],
      orderState: { orderState: "INVALID_STATE"}, // Stato non valido
      creationDate: new Date(),
      warehouseDeparture: 1,
      destinationAddress: "Via Padova, 1"
    };

    const dto = plainToInstance(SellOrderDTO, dtoPlain);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === "orderState")).toBe(true); 
  });


  it('should fail if items is not an array', async () => {
    const dto = new SellOrderDTO();
    dto.orderId = { id: "S7f4837d0-246a-4c75-8589-dfe5f7f4c52a" } as OrderIdDTO;
    dto.items = null as any; // not array
    dto.orderState = { orderState: "PENDING" } as OrderStateDTO;
    dto.creationDate = new Date();
    dto.warehouseDeparture = 1;
    dto.destinationAddress = "Via Padova, 2";

    const errors = await validate(dto);
    expect(errors.some(e => e.property === "items")).toBe(true);
  });

   it("should fail if warehouseDeparture is not an int", async () => {
    const dtoPlain = new SellOrderDTO();
    dtoPlain.orderId = { id: "S7f4837d0-246a-4c75-8589-dfe5f7f4c52a" } as OrderIdDTO;
    dtoPlain.items = [{ item: { itemId: { id: 1}, quantity: 5 }, quantityReserved: 5, unitPrice: 29.99 }] as OrderItemDetailDTO[];
    dtoPlain.orderState = { orderState: "PENDING" } as OrderStateDTO;
    dtoPlain.creationDate = new Date();
    dtoPlain.warehouseDeparture = 1.5 as any; // not an int
    dtoPlain.destinationAddress = '';
     
    const dto = plainToInstance(SellOrderDTO, dtoPlain);

    const errors = await validate(dto);
    expect(errors.some(e => e.property === "warehouseDeparture")).toBe(true);
  });

  it('should fail if destinationAddress is empty', async () => {
    const dtoPlain = {
      orderId: { id: "S123" },
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
    
    // Controlla specificamente per destinationAddress
    const destinationAddressError = errors.find(error => error.property === 'destinationAddress');
    expect(destinationAddressError).toBeDefined();
  });


});
