import { CloudInventoryEventAdapter } from '../../src/infrastructure/adapters/inventory-aggregated-event.adapter';
import { InventoryAggregatedService } from './../../src/application/inventory-aggregated.service';
import { CloudDataMapper } from '../../src/infrastructure/mappers/cloud-data.mapper';
import { SyncProductDTO } from '../../src/interfaces/dto/syncProduct.dto';
import { SyncProductIdDTO } from '../../src/interfaces/dto/syncProductId.dto';
import { SyncWarehouseIdDTO } from '../../src/interfaces/dto/syncWarehouseId.dto';
import { InventoryAggregated } from 'src/domain/inventory-aggregated.entity';
import { Product } from 'src/domain/product.entity';
import { ProductId } from 'src/domain/productId.entity';
import { WarehouseId } from 'src/domain/warehouseId.entity';
import { SyncInventoryDTO } from 'src/interfaces/dto/syncInventory.dto';
import { mock } from 'node:test';

describe('CloudInventoryEventAdapter', () => {
  let adapter: CloudInventoryEventAdapter;
  let service: jest.Mocked<InventoryAggregatedService>;
  let mapper: jest.Mocked<CloudDataMapper>;

  beforeEach(() => {
    service = {
      addProduct: jest.fn(),
      updateProduct: jest.fn(),
      removeProduct: jest.fn(),
      getAll: jest.fn(),
      getAllProducts: jest.fn(),
      getProduct: jest.fn(),
      getProductAggregated: jest.fn(),
    } as any;

    mapper = {
      toDomainProduct: jest.fn(),
      toDomainProductId: jest.fn(),
      toDomainWarehouseId: jest.fn(),
      toDTOInventoryAggregated: jest.fn(),
      toDTOProduct: jest.fn(),
    } as any;

    adapter = new CloudInventoryEventAdapter(service, mapper);
  });

  it('should add product', async () => {
    const dto = {} as SyncProductDTO;
    const domainProduct = {} as Product;
    mapper.toDomainProduct.mockReturnValue(domainProduct);

    await adapter.syncAddedStock(dto);

    expect(mapper.toDomainProduct).toHaveBeenCalledWith(dto);
    expect(service.addProduct).toHaveBeenCalledWith(domainProduct);
  });

  it('should update product', async () => {
    const dto = {} as SyncProductDTO;
    const domainProduct = {} as Product;
    mapper.toDomainProduct.mockReturnValue(domainProduct);

    await adapter.syncEditedStock(dto);

    expect(mapper.toDomainProduct).toHaveBeenCalledWith(dto);
    expect(service.updateProduct).toHaveBeenCalledWith(domainProduct);
  });

  it('should remove product', async () => {
    const idDto = {} as SyncProductIdDTO;
    const warehouseIdDto = {} as SyncWarehouseIdDTO;

    mapper.toDomainProductId.mockReturnValue(new ProductId('1'));
    mapper.toDomainWarehouseId.mockReturnValue(new WarehouseId(1));

    await adapter.syncRemovedStock(idDto, warehouseIdDto);

    expect(mapper.toDomainProductId).toHaveBeenCalledWith(idDto);
    expect(mapper.toDomainWarehouseId).toHaveBeenCalledWith(warehouseIdDto);
    expect(service.removeProduct).toHaveBeenCalledWith(new ProductId('1'), new WarehouseId(1));
  });

  it('should get all inventory', async () => {
    const mockInventory = {} as InventoryAggregated;
    //const mockDto = new InventoryAggregated([new Product(new ProductId("1"),"asd",123,20,0,10,100,new WarehouseId(1))]);
    const pIdDto = new SyncProductIdDTO();
    pIdDto.id = "1";
    const wIdDto = new SyncWarehouseIdDTO();
    wIdDto.warehouseId = 1;
    const mockDto = new SyncInventoryDTO();
    mockDto.productList = [
        {
            id: pIdDto,
            name: "asd",
            unitPrice: 123,
            quantity: 20,
            quantityReserved: 0,
            minThres: 10,
            maxThres: 100,
            warehouseId: wIdDto
        } as SyncProductDTO
    ];
    service.getAll.mockResolvedValue(mockInventory);
    mapper.toDTOInventoryAggregated.mockReturnValue(mockDto);

    const result = await adapter.getAll();

    expect(service.getAll).toHaveBeenCalled();
    expect(mapper.toDTOInventoryAggregated).toHaveBeenCalledWith(mockInventory);
    expect(result).toBe(mockDto);
  });

  it('should get all products', async () => {
    
    const mockInventory = {} as InventoryAggregated;
    const pIdDto = new SyncProductIdDTO();
    pIdDto.id = "1";
    const wIdDto = new SyncWarehouseIdDTO();
    wIdDto.warehouseId = 1;
    const mockDto = new SyncInventoryDTO();
    mockDto.productList = [
        {
            id: pIdDto,
            name: "asd",
            unitPrice: 123,
            quantity: 20,
            quantityReserved: 0,
            minThres: 10,
            maxThres: 100,
            warehouseId: wIdDto
        } as SyncProductDTO
    ];
    service.getAllProducts.mockResolvedValue(mockInventory);
    mapper.toDTOInventoryAggregated.mockReturnValue(mockDto);

    const result = await adapter.getAllProducts();

    expect(service.getAllProducts).toHaveBeenCalled();
    expect(mapper.toDTOInventoryAggregated).toHaveBeenCalledWith(mockInventory);
    expect(result).toBe(mockDto);
  });

  it('should get product and return DTO if found', async () => {
    const idDto = {} as SyncProductIdDTO;
    const warehouseIdDto = {} as SyncWarehouseIdDTO;
    const product = {} as Product;
    const dtoProduct = {} as SyncProductDTO;

    mapper.toDomainProductId.mockReturnValue(new ProductId('1'));
    mapper.toDomainWarehouseId.mockReturnValue(new WarehouseId(1));
    service.getProduct.mockResolvedValue(product);
    mapper.toDTOProduct.mockReturnValue(dtoProduct);

    const result = await adapter.getProduct(idDto, warehouseIdDto);

    expect(service.getProduct).toHaveBeenCalledWith(new ProductId('1'), new WarehouseId(1));
    expect(mapper.toDTOProduct).toHaveBeenCalledWith(product);
    expect(result).toBe(dtoProduct);
  });

  it('should return null if product not found', async () => {
    const idDto = {} as SyncProductIdDTO;
    const warehouseIdDto = {} as SyncWarehouseIdDTO;

    mapper.toDomainProductId.mockReturnValue(new ProductId('1'));
    mapper.toDomainWarehouseId.mockReturnValue(new WarehouseId(1));
    service.getProduct.mockResolvedValue(null);

    const result = await adapter.getProduct(idDto, warehouseIdDto);

    expect(result).toBeNull();
  });

  it('should get aggregated product and return DTO if found', async () => {
    const product = {} as Product;
    const pIdDto = new SyncProductIdDTO();
    pIdDto.id = "1";
    const wIdDto = new SyncWarehouseIdDTO();
    wIdDto.warehouseId = 1;
    const mockDto = new SyncProductDTO();
    mockDto.id = pIdDto;
    mockDto.name = "asd";
    mockDto.unitPrice = 123;
    mockDto.quantity = 20;
    mockDto.quantityReserved = 0;
    mockDto.minThres = 10;
    mockDto.maxThres = 100;
    mockDto.warehouseId = wIdDto;
    mapper.toDomainProductId.mockReturnValue(new ProductId('1'));
    service.getProductAggregated.mockResolvedValue(product);
    mapper.toDTOProduct.mockReturnValue(mockDto);

    const result = await adapter.getProductAggregated(pIdDto);

    expect(service.getProductAggregated).toHaveBeenCalledWith(new ProductId('1'));
    expect(mapper.toDTOProduct).toHaveBeenCalledWith(product);
    expect(result).toBe(mockDto);
  });

  it('should return null if aggregated product not found', async () => {
    const idDto = {} as SyncProductIdDTO;

    mapper.toDomainProductId.mockReturnValue(new ProductId('1'));
    service.getProductAggregated.mockResolvedValue(null);

    const result = await adapter.getProductAggregated(idDto);

    expect(result).toBeNull();
  });
});
