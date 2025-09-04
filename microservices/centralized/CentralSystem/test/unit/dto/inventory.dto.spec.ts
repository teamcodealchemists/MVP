import 'reflect-metadata'; 
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { inventoryDto } from 'src/interfaces/http/dto/inventory.dto';
import { productDto } from 'src/interfaces/http/dto/product.dto';

describe('inventoryDto Validation', () => {
  it('should validate a correct inventoryDto', async () => {
    const product: productDto = {
      id: { id : '123e4567-e89b-12d3-a456-426614174000'},
      name: 'Test Product',
      unitPrice: 10,
      quantity: 5,
      minThres: 1,
      maxThres: 50,
      warehouseId: { warehouseId: 99 },
    };
    const inv = { productList: [product] }
    const dto = plainToInstance(inventoryDto, inv );
    const errors = await validate(dto);
    console.log(errors);
    expect(errors.length).toBe(0);
  });

  it('should fail if productList is not an array', async () => {
    const dto = plainToInstance(inventoryDto, { productList: null });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('productList');
  });

  it('should fail if productList contains invalid productDto', async () => {
    const invalidProduct: any = {
      id: 'not-a-uuid',
      name: 'Bad Product',
      unitPrice: -10,   
      quantity: -5,     
      minThres: -1,     
      maxThres: -10,    
      warehouseId: { warehouseId: 'wrong-type' }, 
    };

    const dto = plainToInstance(inventoryDto, { productList: [invalidProduct] });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
