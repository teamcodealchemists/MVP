import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { productQuantityArrayDto } from 'src/interfaces/http/dto/productQuantityArray.dto';
import { productQuantityDto } from 'src/interfaces/http/dto/productQuantity.dto';

describe('productQuantityArrayDto Validation', () => {
  it('should validate a correct productQuantityArrayDto', async () => {
    const dtoPlain = {
      productQuantityArray: [
        { productId: { id: '123e4567-e89b-12d3-a456-426614174000' }, quantity: 10 },
        { productId: { id: '223e4567-e89b-12d3-a456-426614174111' }, quantity: 5 },
      ],
    };

    const dto = plainToInstance(productQuantityArrayDto, dtoPlain);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should fail if productQuantityArray is not an array', async () => {
    const dtoPlain = {
      productQuantityArray: null,
    };

    const dto = plainToInstance(productQuantityArrayDto, dtoPlain);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('productQuantityArray');
  });

  it('should fail if any item in productQuantityArray is invalid', async () => {
    const dtoPlain = {
      productQuantityArray: [
        { productId: { id: '' }, quantity: 10 }, 
        { productId: { id: '223e4567-e89b-12d3-a456-426614174111' }, quantity: -5 }, // invalid quantity
      ],
    };

    const dto = plainToInstance(productQuantityArrayDto, dtoPlain);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });
});
