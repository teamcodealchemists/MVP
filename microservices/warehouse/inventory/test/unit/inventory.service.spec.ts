import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from '../../src/application/inventory.service';
import { InventoryRepository } from '../../src/domain/inventory.repository';
import { Product } from '../../src/domain/product.entity';
import { ProductId } from '../../src/domain/productId.entity';
import { Inventory } from '../../src/domain/inventory.entity';
import { NotFoundException } from '@nestjs/common';

//Prendiamo la classe di inventory.service.ts e mockiamo inventoryRepository e verifichiamo se il service faccia le robe giuste
describe('Servizio Inventario : Test sul file src/application/inventory.service.ts', () => {
  let service: InventoryService;
  let repository: jest.Mocked<InventoryRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: 'INVENTORYREPOSITORY',
          useValue: {
            getById: jest.fn(),
            getAllProducts: jest.fn(),
            addProduct: jest.fn(),
            removeById: jest.fn(),
            updateProduct: jest.fn(),
            checkProductExistence: jest.fn(),
            checkProductAvailability: jest.fn(),
            checkProductThres: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    repository = module.get('INVENTORYREPOSITORY');
  });

  it('addProduct deve chiamare il repository', async () => {
    const product = new Product(new ProductId('p1'),'Test',10,5,1,20,);
    await service.addProduct(product);
    expect(repository.addProduct).toHaveBeenCalledWith(product);
  });

  it('getProduct deve ritornare un prodotto se esiste', async () => {
    const product = new Product(new ProductId('p1'),'Test',10,5,1,20,);
    repository.getById.mockResolvedValue(product);

    const result = await service.getProduct(new ProductId('p1'));
    expect(result).toEqual(product);
  });

  it('getProduct deve lanciare eccezione se non trovato', async () => {
    repository.getById.mockResolvedValue(null);

    await expect(service.getProduct(new ProductId('404'))).rejects.toThrow(NotFoundException);
  });

  it('getInventory deve ritornare inventario completo', async () => {
    const inventory = new Inventory([]);
    repository.getAllProducts.mockResolvedValue(inventory);

    const result = await service.getInventory();
    expect(result).toBe(inventory);
  });

  it('removeProduct deve ritornare true se eliminato', async () => {
    repository.removeById.mockResolvedValue(true);

    const result = await service.removeProduct(new ProductId('p1'));
    expect(result).toBe(true);
  });
});