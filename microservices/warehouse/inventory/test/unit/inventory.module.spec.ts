import { Test, TestingModule } from '@nestjs/testing';
import { InventoryModule } from '../../src/application/inventory.module';
import { InventoryService } from '../../src/application/inventory.service';
import { OutboundEventAdapter } from 'src/infrastructure/adapters/outbound-event.adapter';
import { InventoryRepositoryMongo } from 'src/infrastructure/adapters/mongodb/inventory.repository.impl';

describe('InventoryModule (unit test)', () => {
  let module: TestingModule;
  let inventoryService: InventoryService;
  let inventoryRepository: InventoryRepositoryMongo;
  let outboundAdapter: OutboundEventAdapter;

  beforeEach(async () => {
    const mockRepo = {
      getById: jest.fn(),
      getAllProducts: jest.fn(),
      addProduct: jest.fn(),
      removeById: jest.fn(),
      updateProduct: jest.fn(),
    };

    const mockOutbound = {
      stockAdded: jest.fn(),
      stockRemoved: jest.fn(),
      stockUpdated: jest.fn(),
      stockShipped: jest.fn(),
      stockReceived: jest.fn(),
      reservedQuantities: jest.fn(),
      sufficientProductAvailability: jest.fn(),
      belowMinThres: jest.fn(),
      aboveMaxThres: jest.fn(),
    };

    module = await Test.createTestingModule({
      imports: [], // non importiamo Mongo o NATS reali
      providers: [
        InventoryService,
        { provide: 'INVENTORYREPOSITORY', useValue: mockRepo },
        { provide: OutboundEventAdapter, useValue: mockOutbound },
      ],
    }).compile();

    inventoryService = module.get<InventoryService>(InventoryService);
    inventoryRepository = module.get<InventoryRepositoryMongo>('INVENTORYREPOSITORY');
    outboundAdapter = module.get<OutboundEventAdapter>(OutboundEventAdapter);
  });

  it('should compile module and service', () => {
    expect(inventoryService).toBeDefined();
    expect(inventoryRepository).toBeDefined();
    expect(outboundAdapter).toBeDefined();
  });

  it('should add a product and call stockAdded', async () => {
    const product = {
      getId: () => 'p1',
      getQuantity: () => 5,
      getMaxThres: () => 10,
    };
    (inventoryRepository.getById as jest.Mock).mockResolvedValue(null);
    (inventoryRepository.addProduct as jest.Mock).mockResolvedValue(undefined);

    await inventoryService.addProduct(product as any);

    expect(inventoryRepository.addProduct).toHaveBeenCalledWith(product);
    expect(outboundAdapter.stockAdded).toHaveBeenCalledWith(product, expect.anything());
  });

  it('should throw if product already exists', async () => {
    const product = { getId: () => 'p1', getQuantity: () => 5, getMaxThres: () => 10 };
    (inventoryRepository.getById as jest.Mock).mockResolvedValue(product);

    await expect(inventoryService.addProduct(product as any)).rejects.toThrow(/already exists/);
  });

  it('should remove a product and call stockRemoved', async () => {
    const productId = { getId: () => 'p1' };
    (inventoryRepository.getById as jest.Mock).mockResolvedValue({ id: 'p1' });
    (inventoryRepository.removeById as jest.Mock).mockResolvedValue(true);

    const result = await inventoryService.removeProduct(productId as any);

    expect(result).toBe(true);
    expect(inventoryRepository.removeById).toHaveBeenCalledWith(productId);
    expect(outboundAdapter.stockRemoved).toHaveBeenCalledWith(productId, expect.anything());
  });

  it('should throw NotFoundException when removing non-existent product', async () => {
    const productId = { getId: () => 'pX' };
    (inventoryRepository.getById as jest.Mock).mockResolvedValue(null);

    await expect(inventoryService.removeProduct(productId as any)).rejects.toThrow();
  });
});
