// src/interfaces/dto/warehouse-state.dto.spec.ts
import 'reflect-metadata'; // necessario per class-validator/class-transformer
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { WarehouseStateDTO } from '../../src/interfaces/dto/warehouse-state.dto';
import { WarehouseIdDTO } from '../../src/interfaces/dto/warehouse-id.dto';

describe('WarehouseStateDTO', () => {

  it('should create a valid DTO from plain object', async () => {
    const plain = {
      warehouseId: { id: 1 },
      state: 'ACTIVE',
    };

    const dto = plainToInstance(WarehouseStateDTO, plain);

    expect(dto).toBeInstanceOf(WarehouseStateDTO);
    expect(dto.warehouseId).toBeInstanceOf(WarehouseIdDTO);
    expect(dto.warehouseId.id).toBe(1);
    expect(dto.state).toBe('ACTIVE');

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation if state is missing', async () => {
    const plain = {
      warehouseId: { id: 1 },
    };

    const dto = plainToInstance(WarehouseStateDTO, plain);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('state');
  });

  it('should fail validation if state is not a string', async () => {
    const plain = {
      warehouseId: { id: 1 },
      state: 123, // errore
    };

    const dto = plainToInstance(WarehouseStateDTO, plain);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('state');
  });

  it('should fail validation if warehouseId is missing', async () => {
    const plain = {
      state: 'ACTIVE',
    };

    const dto = plainToInstance(WarehouseStateDTO, plain);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('warehouseId');
  });
});
