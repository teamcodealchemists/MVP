import 'reflect-metadata';
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { OrderQuantityDTO } from 'src/interfaces/dto/orderQuantity.dto';

describe('OrderQuantityDTO Validation', () => {
  it('should validate a correct DTO', async () => {
    const dtoPlain = {
      id: { id: "I17823131574457569" },
      items: [
            {  
                itemId: { id: 1 }, 
                quantity: 5 
            },
            { 
                itemId: { id: 2 }, 
                quantity: 10 
              }
      ]
    };

    const dto = plainToInstance(OrderQuantityDTO, dtoPlain);
    const errors = await validate(dto);
    
    expect(errors.length).toBe(0);
  });

 it('should fail if id is missing', async () => {
    const dtoPlain = {
      items: [
        { itemId: { id: 1 }, quantity: 5 }
      ]
    };

    const dto = plainToInstance(OrderQuantityDTO, dtoPlain);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'id')).toBe(true);
  });

  it('should fail if items is empty', async () => {
    const dtoPlain = {
      id: { id: "I17823131574457569" },
      items: []
    };

    const dto = plainToInstance(OrderQuantityDTO, dtoPlain);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'items')).toBe(true);
  });


  it('should fail if item quantity is negative', async () => {
    const dtoPlain = {
      id: { id: "I17823131574457569" },
      items: [
        { itemId: { id: 1 }, quantity: -5 } // Quantity negativa
      ]
    };

    const dto = plainToInstance(OrderQuantityDTO, dtoPlain);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });


  it('should fail if itemId is missing', async () => {
    const dtoPlain = {
      id: { id: "I17823131574457569" },
      items: [
        { quantity: 5 } // Manca itemId
      ]
    };

    const dto = plainToInstance(OrderQuantityDTO, dtoPlain);
    const errors = await validate(dto);
    
    expect(errors.length).toBeGreaterThan(0);
  });
});
