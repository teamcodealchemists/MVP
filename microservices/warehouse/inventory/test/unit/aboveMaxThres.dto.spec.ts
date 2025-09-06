import 'reflect-metadata';
import { AboveMaxThresDto } from '../../src/interfaces/dto/aboveMaxThres.dto';
import { ProductIdDto } from '../../src/interfaces/dto/productId.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

describe('AboveMaxThresDto', () => {
  it('should create an instance with proper values', () => {
    const dto = new AboveMaxThresDto();
    dto.id = { id: 'p1' } as ProductIdDto;
    dto.quantity = 10;
    dto.maxThres = 20;

    expect(dto.id.id).toBe('p1');
    expect(dto.quantity).toBe(10);
    expect(dto.maxThres).toBe(20);
  });

  it('should validate correctly with valid values', async () => {
    const plain = {
      id: { id: 'p1' },
      quantity: 5,
      maxThres: 15,
    };
    const dto = plainToInstance(AboveMaxThresDto, plain);
    const errors = await validate(dto);
    expect(errors.length).toBe(0); // nessun errore di validazione
  });

  it('should fail validation for negative numbers', async () => {
    const plain = {
      id: { id: 'p1' },
      quantity: -5,
      maxThres: -10,
    };
    const dto = plainToInstance(AboveMaxThresDto, plain);
    const errors = await validate(dto);
    expect(errors.length).toBe(2); // quantity e maxThres devono essere >= 0
    expect(errors.map(e => e.property)).toEqual(expect.arrayContaining(['quantity', 'maxThres']));
  });
});
