import 'reflect-metadata'; 
import { BelowMinThresDto } from '../../src/interfaces/dto/belowMinThres.dto';
import { ProductIdDto } from '../../src/interfaces/dto/productId.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

describe('BelowMinThresDto', () => {
  it('should create an instance with proper values', () => {
    const dto = new BelowMinThresDto();
    dto.id = { id: 'p1' } as ProductIdDto;
    dto.quantity = 10;
    dto.minThres = 5;

    expect(dto.id.id).toBe('p1');
    expect(dto.quantity).toBe(10);
    expect(dto.minThres).toBe(5);
  });

  it('should validate correctly with valid values', async () => {
    const plain = {
      id: { id: 'p1' },
      quantity: 7,
      minThres: 3,
    };
    const dto = plainToInstance(BelowMinThresDto, plain);
    const errors = await validate(dto);
    expect(errors.length).toBe(0); 
  });

  it('should fail validation for negative numbers', async () => {
    const plain = {
      id: { id: 'p1' },
      quantity: -1,
      minThres: -2,
    };
    const dto = plainToInstance(BelowMinThresDto, plain);
    const errors = await validate(dto);
    expect(errors.length).toBe(2);
    expect(errors.map(e => e.property)).toEqual(expect.arrayContaining(['quantity', 'minThres']));
  });
});
