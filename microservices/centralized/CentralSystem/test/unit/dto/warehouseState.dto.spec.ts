import 'reflect-metadata';
import { validate } from 'class-validator';
import { WarehouseStateDTO } from 'src/interfaces/http/dto/warehouseStatedto';
import { warehouseIdDto } from 'src/interfaces/http/dto/warehouseId.dto';

describe('WarehouseStateDTO Validation', () => {
  it('should validate a correct WarehouseStateDTO', async () => {
    const dto = new WarehouseStateDTO();
    dto.state = 'ACTIVE';
    dto.warehouseId = new warehouseIdDto();
    dto.warehouseId.warehouseId = 1;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if warehouseId is missing', async () => {
    const dto = new WarehouseStateDTO();
    dto.state = 'ACTIVE';
    dto.warehouseId = null as any;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('warehouseId');
  });

  it('should fail if warehouseId is invalid', async () => {
    const dto = new WarehouseStateDTO();
    dto.state = 'ACTIVE';
    dto.warehouseId = new warehouseIdDto();
    dto.warehouseId.warehouseId = NaN; // invalid

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('warehouseId');
  });
});
