import 'reflect-metadata'; 
import { InventoryDto } from '../../src/interfaces/dto/inventory.dto';
import { ProductDto } from '../../src/interfaces/dto/product.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

describe('InventoryDto', () => {
  it('should create an instance with a product list', () => {
    const product: ProductDto = {
      id: { id: 'p1' },
      name: 'Product 1',
      unitPrice: 100,
      quantity: 10,
      quantityReserved: 2,
      minThres: 1,
      maxThres: 20,
      warehouseId: { warehouseId: 1 },
    };

    const dto = new InventoryDto();
    dto.productList = [product];

    expect(dto.productList).toHaveLength(1);
    expect(dto.productList[0].name).toBe('Product 1');
  });

  it('should validate correctly with a proper product list', async () => {
    const plain = {
      productList: [
        {
          id: { id: 'p1' },
          name: 'Product 1',
          unitPrice: 100,
          quantity: 10,
          quantityReserved: 2,
          minThres: 1,
          maxThres: 20,
          warehouseId: { warehouseId: 1 },
        },
      ],
    };

    const dto = plainToInstance(InventoryDto, plain);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should fail validation if productList is not an array', async () => {
    const plain = {
      productList: 'not-an-array',
    };
    const dto = plainToInstance(InventoryDto, plain);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('productList');
  });
});
