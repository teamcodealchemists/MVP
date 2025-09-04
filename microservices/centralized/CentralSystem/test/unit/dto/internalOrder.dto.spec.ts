// test/unit/internalOrderDto.spec.ts
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import 'reflect-metadata';
import { InternalOrderDTO } from "src/interfaces/http/dto/internalOrder.dto";
import { OrderIdDTO } from "src/interfaces/http/dto/orderId.dto";
import { OrderItemDTO } from "src/interfaces/http/dto/orderItem.dto";
import { OrderStateDTO } from "src/interfaces/http/dto/orderState.dto";

describe("InternalOrderDTO Validation", () => {
  it("should validate a correct DTO", async () => {
  const dtoPlain = {
    orderId: { id: "I123" },
    items: [
      { itemId: { id: 1 }, quantity: 5, quantityReserved: 0, unitPrice: 100 }
    ],
    orderState: "PENDING",
    creationDate: new Date(),
    warehouseDeparture: 1,
    warehouseDestination: 2
  };

  const dto = plainToInstance(InternalOrderDTO, dtoPlain);
  const errors = await validate(dto);
  console.log(errors);
  expect(errors.length).toBe(0);
});

  it("should fail if orderId is missing", async () => {
    const dto = new InternalOrderDTO();
    dto.items = [];
    dto.orderState = { orderState: "PENDING" } as OrderStateDTO;
    dto.creationDate = new Date();
    dto.warehouseDeparture = 1;
    dto.warehouseDestination = 2;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("orderId");
  });

  it("should fail if items is not an array", async () => {
    const dto = new InternalOrderDTO();
    dto.orderId = { id: "I123" } as OrderIdDTO;
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
    dto.orderId = { id: "I123" } as OrderIdDTO;
    dto.items = [{ itemId: { id: 1 }, quantity: 5 }] as OrderItemDTO[];
    dto.orderState = { orderState: "PENDING" } as OrderStateDTO;
    dto.creationDate = new Date();
    dto.warehouseDeparture = 1.5 as any; // not an int
    dto.warehouseDestination = 2;

    const errors = await validate(dto);
    expect(errors.some(e => e.property === "warehouseDeparture")).toBe(true);
  });
});
