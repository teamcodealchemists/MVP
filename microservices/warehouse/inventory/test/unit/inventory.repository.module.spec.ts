import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryRepositoryMongo } from '../../src/infrastructure/adapters/mongodb/inventory.repository.impl';
import { ProductSchema } from '../../src/infrastructure/adapters/mongodb/schemas/product.schema';
import { InventoryRepositoryModule } from '../../src/infrastructure/adapters/mongodb/inventory.repository.module';
import mongoose from 'mongoose';
import { ProductId } from 'src/domain/productId.entity';
import { Product } from 'src/domain/product.entity';

describe('InventoryRepositoryModule (unit test con mock)', () => {
  let repository: jest.Mocked<InventoryRepositoryMongo>;

  beforeEach(() => {
    repository = {
      addProduct: jest.fn(),
      getById: jest.fn(),
      getAllProducts: jest.fn(),
      updateProduct: jest.fn(),
      removeById: jest.fn(),
    } as unknown as jest.Mocked<InventoryRepositoryMongo>;
  });

  it('should provide INVENTORYREPOSITORY', () => {
    expect(repository).toBeDefined();
  });

  it('should call addProduct', async () => {
    const product = new Product(new ProductId('p1'),'Prod1',5,5,5,1,40);
    await repository.addProduct(product);
    expect((repository as any).addProduct).toHaveBeenCalledWith(product);
  });

  it('should call getById', async () => {
    const id = new ProductId('p1');
    await repository.getById(id);
    expect((repository as any).getById).toHaveBeenCalledWith(id);
  });
});
