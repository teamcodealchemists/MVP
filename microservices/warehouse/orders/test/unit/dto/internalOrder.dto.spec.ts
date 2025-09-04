// test/unit/internalOrderDto.spec.ts
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import 'reflect-metadata';
import { InternalOrderDTO } from "src/interfaces/dto/internalOrder.dto";
import { OrderIdDTO } from "src/interfaces//dto/orderId.dto";
import { OrderItemDetailDTO } from "src/interfaces/dto/orderItemDetail.dto";
import { OrderStateDTO } from "src/interfaces/dto/orderState.dto";

describe("InternalOrderDTO Validation", () => {
  it("should validate a correct DTO", async () => {
  const dtoPlain = {
    orderId: { id: "I7f4837d0-246a-4c75-8589-dfe5f7f4c52a" },
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
    warehouseDestination: 2
  };

  const dto = plainToInstance(InternalOrderDTO, dtoPlain);
  const errors = await validate(dto);
  console.log(errors);
  expect(errors.length).toBe(0);
  });

  it("should fail if orderId doesn't start with I or S", async () => {
    const dtoPlain = {
      orderId: { id: "X-1234-1234-1234-123456789012" }, // Inizia con X invece di I/S
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
      warehouseDestination: 2
    };

    const dto = plainToInstance(InternalOrderDTO, dtoPlain);
    const errors = await validate(dto);
    
    expect(errors.length).toBeGreaterThan(0);
  });


  it("should fail if orderState is not a valid OrderState", async () => {
    const dtoPlain = {
      orderId: { id: "I7f4837d0-246a-4c75-8589-dfe5f7f4c52a" },
      items: [{ 
        item: { 
          itemId: { id: 1 }, 
          quantity: 5 
        }, 
        quantityReserved: 5, 
        unitPrice: 29.99 
      }],
      orderState: { orderState: "INVALID_STATE" }, // Stato non valido
      creationDate: new Date(),
      warehouseDeparture: 1,
      warehouseDestination: 2
    };

    const dto = plainToInstance(InternalOrderDTO, dtoPlain);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    
    // Cerca errori a qualsiasi livello di nesting
    const hasOrderStateError = errors.some(error => 
      error.property === 'orderState' ||
      (error.children && error.children.some(child => 
        child.property === 'orderState' ||
        (child.children && child.children.some(grandChild => 
          grandChild.property === 'orderState'
        ))
      ))
    );
    
    expect(hasOrderStateError).toBe(true);
  });

  
  it("should fail if items is not an array", async () => {
    const dto = new InternalOrderDTO();
    dto.orderId = { id: "I7f4837d0-246a-4c75-8589-dfe5f7f4c52a" } as OrderIdDTO;
    dto.items = null as any; // not array
    dto.orderState = { orderState: "PENDING" } as OrderStateDTO;
    dto.creationDate = new Date();
    dto.warehouseDeparture = 1;
    dto.warehouseDestination = 2;

    const errors = await validate(dto);
    expect(errors.some(e => e.property === "items")).toBe(true);
  });

  it("should fail if warehouseDeparture is not an int", async () => {
    const dto = new InternalOrderDTO();
    dto.orderId = { id: "I7f4837d0-246a-4c75-8589-dfe5f7f4c52a" } as OrderIdDTO;
    dto.items = [{ item: { itemId: { id: 1}, quantity: 5 }, quantityReserved: 5, unitPrice: 29.99 }] as OrderItemDetailDTO[];
    dto.orderState = { orderState: "PENDING" } as OrderStateDTO;
    dto.creationDate = new Date();
    dto.warehouseDeparture = 1.5 as any; // not an int
    dto.warehouseDestination = 2;

    const errors = await validate(dto);
    expect(errors.some(e => e.property === "warehouseDeparture")).toBe(true);
  });  

  it("should fail if warehouseDestination is not an int", async () => {
    const dto = new InternalOrderDTO();
    dto.orderId = { id: "I7f4837d0-246a-4c75-8589-dfe5f7f4c52a" } as OrderIdDTO;
    dto.items = [{ item: { itemId: { id: 1}, quantity: 5 }, quantityReserved: 5, unitPrice: 29.99 }] as OrderItemDetailDTO[];
    dto.orderState = { orderState: "PENDING" } as OrderStateDTO;
    dto.creationDate = new Date();
    dto.warehouseDeparture = 1; 
    dto.warehouseDestination = 2.5; // not an int

    const errors = await validate(dto);
    expect(errors.some(e => e.property === "warehouseDestination")).toBe(true);
  });
});
