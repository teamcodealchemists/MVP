import { InventoryAggregatedService } from '../../src/application/inventory-aggregated.service';
import { InventoryAggregatedRepository } from 'src/domain/inventory-aggregated.repository';
import { Product } from '../../src/domain/product.entity';
import { ProductId } from 'src/domain/productId.entity';
import { WarehouseId } from 'src/domain/warehouseId.entity';
import { InventoryAggregated } from 'src/domain/inventory-aggregated.entity';

describe('InventoryAggregatedService', () => {
  let service: InventoryAggregatedService;
  let repository: jest.Mocked<InventoryAggregatedRepository>;

  beforeEach(() => {
    repository = {
      addProduct: jest.fn(),
      updateProduct: jest.fn(),
      removeProduct: jest.fn(),
      getAllProducts: jest.fn(),
      getAll: jest.fn(),
      getProduct: jest.fn(),
      getProductAggregated: jest.fn(),
    } as unknown as jest.Mocked<InventoryAggregatedRepository>;

    service = new InventoryAggregatedService(repository);
  });

  it('should add a product', async () => {
    const product = {} as Product;
    await service.addProduct(product);
    expect(repository.addProduct).toHaveBeenCalledWith(product);
  });

  it('should update a product', async () => {
    const product = {} as Product;
    await service.updateProduct(product);
    expect(repository.updateProduct).toHaveBeenCalledWith(product);
  });

  it('should remove a product', async () => {
    const id = {} as ProductId;
    const warehouseId = {} as WarehouseId;
    await service.removeProduct(id, warehouseId);
    expect(repository.removeProduct).toHaveBeenCalledWith(id, warehouseId);
  });

  it('should return all products', async () => {
    const mockAggregated = {} as InventoryAggregated;
    repository.getAllProducts.mockResolvedValue(mockAggregated);

    const result = await service.getAllProducts();
    expect(result).toBe(mockAggregated);
  });

  it('should return all inventory', async () => {
    const mockAggregated = {} as InventoryAggregated;
    repository.getAll.mockResolvedValue(mockAggregated);

    const result = await service.getAll();
    expect(result).toBe(mockAggregated);
  });

  it('should return a product if found', async () => {
    const mockProduct = {} as Product;
    repository.getProduct.mockResolvedValue(mockProduct);

    const result = await service.getProduct({} as ProductId, {} as WarehouseId);
    expect(result).toBe(mockProduct);
  });

  it('should throw if product not found in warehouse', async () => {
    repository.getProduct.mockResolvedValue(null);

    await expect(
      service.getProduct({} as ProductId, {} as WarehouseId),
    ).rejects.toThrow('Product not found in the specified warehouse');
  });

  it('should return an aggregated product if found', async () => {
    const mockProduct = {} as Product;
    repository.getProductAggregated.mockResolvedValue(mockProduct);

    const result = await service.getProductAggregated({} as ProductId);
    expect(result).toBe(mockProduct);
  });

  it('should throw if aggregated product not found', async () => {
    repository.getProductAggregated.mockResolvedValue(null);

    await expect(
      service.getProductAggregated({} as ProductId),
    ).rejects.toThrow('Product not found in the specified warehouse');
  });
});
