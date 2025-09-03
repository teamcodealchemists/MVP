import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { productQuantityDto } from 'src/interfaces/http/dto/productQuantity.dto';
import { productIdDto } from 'src/interfaces/http/dto/productId.dto';

describe('productQuantityDto Validation', () => {
  it('should validate a correct productQuantityDto', async () => {
    const dtoPlain = {
      productId: { id: '123e4567-e89b-12d3-a456-426614174000' },
      quantity: 10,
    };

    const dto = plainToInstance(productQuantityDto, dtoPlain);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should fail if quantity is negative', async () => {
    const dtoPlain = {
      productId: { id: '123e4567-e89b-12d3-a456-426614174000' },
      quantity: -5,
    };

    const dto = plainToInstance(productQuantityDto, dtoPlain);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('quantity');
  });

  /*it('should fail if productId is invalid', async () => {
    const dtoPlain = {
      productId: { id: "" },
      quantity: 5,
    };

    const dto = plainToInstance(productQuantityDto, dtoPlain);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('productId');
  });*/
});
