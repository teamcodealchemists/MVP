import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { OrderItemDetailDTO } from 'src/interfaces/http/dto/orderItemDetail.dto';
import { OrderItemDTO } from 'src/interfaces/http/dto/orderItem.dto';

describe('OrderItemDetailDTO Validation', () => {
  it('should validate a correct OrderItemDetailDTO', async () => {
    const dtoPlain = {
      item: { itemId: { id: 1 }, quantity: 5 } as OrderItemDTO,
      quantityReserved: 2,
      unitPrice: 10.5,
    };

    const dto = plainToInstance(OrderItemDetailDTO, dtoPlain);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should fail if quantityReserved is negative', async () => {
    const dtoPlain = {
      item: { itemId: { id: 1 }, quantity: 5 } as OrderItemDTO,
      quantityReserved: -1,
      unitPrice: 10,
    };

    const dto = plainToInstance(OrderItemDetailDTO, dtoPlain);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('quantityReserved');
  });

  it('should fail if unitPrice has more than 2 decimal places', async () => {
    const dtoPlain = {
      item: { itemId: { id: 1 }, quantity: 5 } as OrderItemDTO,
      quantityReserved: 1,
      unitPrice: 10.123,
    };

    const dto = plainToInstance(OrderItemDetailDTO, dtoPlain);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('unitPrice');
  });

  it('should fail if item is missing', async () => {
    const dtoPlain = {
      quantityReserved: 1,
      unitPrice: 10,
    };

    const dto = plainToInstance(OrderItemDetailDTO, dtoPlain);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('item');
  });
});
