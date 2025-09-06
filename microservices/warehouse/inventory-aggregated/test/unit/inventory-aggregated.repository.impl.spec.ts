import { Test, TestingModule } from '@nestjs/testing';
import { InventoryAggregatedRepositoryImpl } from '../../src/infrastructure/adapters/mongodb/inventory-aggregated.repository.impl';
import { InventoryAggregated } from '../../src/domain/inventory-aggregated.entity';
import { Product } from '../../src/domain/product.entity';
import { ProductId } from '../../src/domain/productId.entity';
import { WarehouseId } from '../../src/domain/warehouseId.entity';
import { SyncProduct } from '../../src/infrastructure/adapters/mongodb/schemas/syncProduct.schema';
import { Model } from 'mongoose';

describe('InventoryAggregatedRepositoryImpl', () => {
  let repository: InventoryAggregatedRepositoryImpl;
  let mockProductModel: Partial<Record<keyof Model<SyncProduct>, jest.Mock>>;

  beforeEach(async () => {
    mockProductModel = {
      find: jest.fn(),
      findOne: jest.fn(),
      deleteOne: jest.fn(() => ({ exec: jest.fn() })),
      updateOne: jest.fn(() => ({ exec: jest.fn() })),
      aggregate: jest.fn(() => ({ exec: jest.fn() })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryAggregatedRepositoryImpl,
        { provide: 'SyncProductModel', useValue: mockProductModel },
      ],
    }).compile();

    repository = module.get<InventoryAggregatedRepositoryImpl>(InventoryAggregatedRepositoryImpl);
  });

  it('should add a product', async () => {
  const saveMock = jest.fn().mockResolvedValue(undefined);

  const MockModel = jest.fn().mockImplementation(() => ({
    save: saveMock,
  }));

  (repository as any).productModel = MockModel;

  const product = new Product(
    new ProductId('1'),
    'asd',
    123,
    10,
    0,
    5,
    100,
    new WarehouseId(1),
  );

  await repository.addProduct(product);

  expect(saveMock).toHaveBeenCalled();
  expect(MockModel).toHaveBeenCalledWith({
    warehouseId: 1,
    productId: '1',
    name: 'asd',
    unitPrice: 123,
    quantity: 10,
    quantityReserved: 0,
    minThres: 5,
    maxThres: 100,
  });
});


  it('should remove a product', async () => {
    const id = new ProductId('1');
    const warehouseId = new WarehouseId(1);

    const execMock = jest.fn();
    mockProductModel.deleteOne = jest.fn(() => ({ exec: execMock }));

    await repository.removeProduct(id, warehouseId);
    expect(mockProductModel.deleteOne).toHaveBeenCalledWith({ productId: '1', warehouseId: 1 });
    expect(execMock).toHaveBeenCalled();
  });

  it('should update a product', async () => {
    const product = new Product(
      new ProductId('1'),
      'asd',
      123,
      10,
      0,
      5,
      100,
      new WarehouseId(1),
    );

    const execMock = jest.fn();
    mockProductModel.updateOne = jest.fn(() => ({ exec: execMock }));

    await repository.updateProduct(product);
    expect(mockProductModel.updateOne).toHaveBeenCalledWith(
      { productId: product.getId().getId() },
      {
        name: product.getName(),
        unitPrice: product.getUnitPrice(),
        quantity: product.getQuantity(),
        quantityReserved: product.getQuantityReserved(),
        minThres: product.getMinThres(),
        maxThres: product.getMaxThres(),
        warehouseId: product.getWarehouseId().getId(),
      },
    );
    expect(execMock).toHaveBeenCalled();
  });

  it('should get all products', async () => {
    const mockDocs = [
      {
        _id: 'asd',
        productIds: ['1'],
        unitPrice: 123,
        quantity: 10,
        quantityReserved: 0,
        minThres: 5,
        maxThres: 100,
        warehouseId: 0,
      },
    ];

    const execMock = jest.fn().mockResolvedValue(mockDocs);
    mockProductModel.aggregate = jest.fn(() => ({ exec: execMock }));

    const result = await repository.getAllProducts();
    console.log(JSON.stringify(result));
    expect(mockProductModel.aggregate).toHaveBeenCalled();
    expect(result).toBeInstanceOf(InventoryAggregated);
    expect(result.getInventory()[0].getId().getId()).toBe('1');
    expect(result.getInventory()[0].getWarehouseId().getId()).toBe(0);
  });

  it('should get all inventory', async () => {
    const mockDocs = [
      {
        _id: 'asd',
        productId: '1',
        unitPrice: 123,
        quantity: 10,
        quantityReserved: 0,
        minThres: 5,
        maxThres: 100,
        warehouseId: 1,
      },
    ];

    const execMock = jest.fn().mockResolvedValue(mockDocs);
    mockProductModel.find = jest.fn(() => ({ exec: execMock }));

    const result = await repository.getAll();
    expect(mockProductModel.find).toHaveBeenCalled();
    expect(result).toBeInstanceOf(InventoryAggregated);
    expect(result.getInventory()[0].getId().getId()).toBe('1');
    expect(result.getInventory()[0].getWarehouseId().getId()).toBe(1);
  });

  it('should get a single product', async () => {
    const execMock = jest.fn().mockResolvedValue({
      productId: '1',
      name: 'asd',
      unitPrice: 123,
      quantity: 10,
      quantityReserved: 0,
      minThres: 5,
      maxThres: 100,
      warehouseId: 1,
    });
    mockProductModel.findOne = jest.fn(() => ({ exec: execMock }));

    const result = await repository.getProduct(new ProductId('1'), new WarehouseId(1));

    expect(mockProductModel.findOne).toHaveBeenCalledWith({ productId: '1', warehouseId: 1 });
    expect(result?.getId().getId()).toBe('1');
    expect(result?.getName()).toBe('asd');
  });

  it('should return null if product not found', async () => {
    const execMock = jest.fn().mockResolvedValue(null);
    mockProductModel.findOne = jest.fn(() => ({ exec: execMock }));

    const result = await repository.getProduct(new ProductId('1'), new WarehouseId(1));
    expect(result).toBeNull();
  });

  it('should get aggregated product', async () => {
    const mockDocs = [
      {
        productId: '1',  
        name: 'asd',
        unitPrice: 123,
        quantity: 10,
        quantityReserved: 0,
        minThres: 5,
        maxThres: 100,
        warehouseId: 0,
      },
    ];

    mockProductModel.aggregate = jest.fn(() => ({
      exec: jest.fn().mockResolvedValue(mockDocs),
    }));

    const result = await repository.getProductAggregated(new ProductId('1'));

    expect(mockProductModel.aggregate).toHaveBeenCalled();
    expect(result?.getId().getId()).toBe('1');  
    expect(result?.getName()).toBe('asd');
  });

  it('should return null if aggregated product not found', async () => {
    const execMock = jest.fn().mockResolvedValue([]);
    mockProductModel.aggregate = jest.fn(() => ({ exec: execMock }));

    const result = await repository.getProductAggregated(new ProductId('1'));
    expect(result).toBeNull();
  });
});
