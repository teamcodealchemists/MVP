jest.mock('class-validator', () => ({
  validateOrReject: jest.fn().mockResolvedValue(undefined),
  IsNumber: () => () => {},
  IsString: () => () => {},
  IsOptional: () => () => {},
  IsNotEmpty : () => () => {},
  Min: () => () => {},
}));
import { Test, TestingModule } from '@nestjs/testing';
import { CommandHandler } from '../../src/interfaces/commandHandler.controller';
import { CloudInventoryEventAdapter } from 'src/infrastructure/adapters/inventory-aggregated-event.adapter';
import { validateOrReject } from 'class-validator';
import { SyncInventoryDTO } from 'src/interfaces/dto/syncInventory.dto';
import { SyncProductIdDTO } from 'src/interfaces/dto/syncProductId.dto';
import { SyncWarehouseIdDTO } from 'src/interfaces/dto/syncWarehouseId.dto';


describe('CommandHandler', () => {
  let handler: CommandHandler;
  let adapter: jest.Mocked<CloudInventoryEventAdapter>;

    const mockAdapter: Partial<CloudInventoryEventAdapter> = {
    syncAddedStock: jest.fn(),
    syncRemovedStock: jest.fn(),
    syncEditedStock: jest.fn(),
    getProductAggregated: jest.fn(),
    getProduct: jest.fn(),
    getAllProducts: jest.fn(),
    getAll: jest.fn(),
    };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommandHandler],
      providers: [
        {
          provide: CloudInventoryEventAdapter,
          useValue: mockAdapter,
        },
      ],
    }).compile();

    handler = module.get<CommandHandler>(CommandHandler);
    adapter = module.get(CloudInventoryEventAdapter);
    jest.clearAllMocks();
  });

  // -------------------------------
  //      EventPattern Tests
  // -------------------------------

  it('should sync added stock', async () => {
    const payload = {
      product: {
        id: { id: '1' },
        name: 'asd',
        unitPrice: 123,
        quantity: 10,
        quantityReserved: 0,
        minThres: 5,
        maxThres: 100,
        warehouseId: { warehouseId: 1 },
      },
    };

    await handler.syncAddedStock(payload);

    expect(adapter.syncAddedStock).toHaveBeenCalled();
    const dtoArg = adapter.syncAddedStock.mock.calls[0][0];
    expect(dtoArg.id.id).toBe('1');
    expect(dtoArg.warehouseId.warehouseId).toBe(1);
  });

  it('should sync removed stock', async () => {
    const payload = {
      productId: { id: '1' },
      warehouseId: { warehouseId: 1 },
    };

    await handler.syncRemovedStock(payload);

    expect(adapter.syncRemovedStock).toHaveBeenCalled();
    const [productIdArg, warehouseArg] = adapter.syncRemovedStock.mock.calls[0];
    expect(productIdArg.id).toBe('1');
    expect(warehouseArg.warehouseId).toBe(1);
  });

  it('should sync edited stock', async () => {
    const payload = {
      product: {
        id: { id: '1' },
        name: 'asd',
        unitPrice: 123,
        quantity: 10,
        quantityReserved: 0,
        minThres: 5,
        maxThres: 100,
        warehouseId: { warehouseId: 1 },
      },
    };

    await handler.syncEditedStock(payload);

    expect(adapter.syncEditedStock).toHaveBeenCalled();
    const dtoArg = adapter.syncEditedStock.mock.calls[0][0];
    expect(dtoArg.id.id).toBe('1');
    expect(dtoArg.name).toBe('asd');
  });

  // -------------------------------
  //      MessagePattern Tests
  // -------------------------------

  it('should return aggregated product', async () => {
    const mockProduct = {
      id: { id: '1' },
      name: 'asd',
      unitPrice: 123,
      quantity: 10,
      quantityReserved: 0,
      minThres: 5,
      maxThres: 100,
      warehouseId: { warehouseId: 1 },
    };
    adapter.getProductAggregated.mockResolvedValue(mockProduct);

    const context = { getSubject: () => 'get.aggregatedWarehouses.stock.1' };
    const result = await handler.getProductAggregated(context);

    expect(adapter.getProductAggregated).toHaveBeenCalled();
    expect(JSON.parse(result).result.model.id).toBe('1');
  });

  it('should return product by warehouse', async () => {
    const mockProduct = {
      id: { id: '1' },
      name: 'asd',
      unitPrice: 123,
      quantity: 10,
      quantityReserved: 0,
      minThres: 5,
      maxThres: 100,
      warehouseId: { warehouseId: 1 },
    };
    adapter.getProduct.mockResolvedValue(mockProduct);

    const context = { getSubject: () => 'get.aggregatedWarehouses.warehouse.1.stock.1' };
    const result = await handler.getProduct(context);

    expect(adapter.getProduct).toHaveBeenCalled();
    const parsed = JSON.parse(result).result.model;
    expect(parsed.id).toBe('1');
    expect(parsed.warehouseId).toBe(1);
  });

  it('should get all products', async () => {
    const mockProducts: SyncInventoryDTO = {
    productList: [
        {
        id: { id: '1' } as SyncProductIdDTO,
        name: 'Product 1',
        unitPrice: 123,
        quantity: 10,
        quantityReserved: 0,
        minThres: 5,
        maxThres: 100,
        warehouseId: { warehouseId: 1 } as SyncWarehouseIdDTO,
        },
        {
        id: { id: '2' } as SyncProductIdDTO,
        name: 'Product 2',
        unitPrice: 456,
        quantity: 5,
        quantityReserved: 0,
        minThres: 2,
        maxThres: 50,
        warehouseId: { warehouseId: 1 } as SyncWarehouseIdDTO,
        },
    ],
    };
    adapter.getAllProducts.mockResolvedValue(mockProducts);

    const result = await handler.getAllProducts();

    expect(adapter.getAllProducts).toHaveBeenCalled();
    const parsed = JSON.parse(result);
    expect(parsed.result.collection.length).toBe(2);
    expect(parsed.result.collection[0].rid).toBe('aggregatedWarehouses.stock.1');
  });

  it('should get all inventory', async () => {
    const mockProducts: SyncInventoryDTO = {
    productList: [
        {
        id: { id: '1' } as SyncProductIdDTO,
        name: 'Product 1',
        unitPrice: 123,
        quantity: 10,
        quantityReserved: 0,
        minThres: 5,
        maxThres: 100,
        warehouseId: { warehouseId: 1 } as SyncWarehouseIdDTO,
        },
        {
        id: { id: '2' } as SyncProductIdDTO,
        name: 'Product 2',
        unitPrice: 456,
        quantity: 5,
        quantityReserved: 0,
        minThres: 2,
        maxThres: 50,
        warehouseId: { warehouseId: 1 } as SyncWarehouseIdDTO,
        },
    ],
    };
    adapter.getAll.mockResolvedValue(mockProducts);

    const result = await handler.getAll();

    expect(adapter.getAll).toHaveBeenCalled();
    const parsed = JSON.parse(result);
    expect(parsed.result.collection[0].rid).toBe('aggregatedWarehouses.warehouse.1.stock.1');
  });

  it('should get inventory', async () => {
    const mockProducts: SyncInventoryDTO = {
    productList: [
        {
        id: { id: '1' } as SyncProductIdDTO,
        name: 'Product 1',
        unitPrice: 123,
        quantity: 10,
        quantityReserved: 0,
        minThres: 5,
        maxThres: 100,
        warehouseId: { warehouseId: 1 } as SyncWarehouseIdDTO,
        },
        {
        id: { id: '2' } as SyncProductIdDTO,
        name: 'Product 2',
        unitPrice: 456,
        quantity: 5,
        quantityReserved: 0,
        minThres: 2,
        maxThres: 50,
        warehouseId: { warehouseId: 1 } as SyncWarehouseIdDTO,
        },
    ],
    };
    adapter.getAll.mockResolvedValue(mockProducts);

    const result = await handler.getInventory();

    expect(adapter.getAll).toHaveBeenCalled();
    const parsed = JSON.parse(result);
    expect(parsed.products[0].id.id).toBe('1');
  });
});