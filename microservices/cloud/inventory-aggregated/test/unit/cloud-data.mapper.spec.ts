import 'reflect-metadata';
import { CloudDataMapper } from '../../src/infrastructure/mappers/cloud-data.mapper';
import { SyncProductDTO } from '../../src/interfaces/dto/syncProduct.dto';
import { SyncProductIdDTO } from '../../src/interfaces/dto/syncProductId.dto';
import { SyncWarehouseIdDTO } from '../../src/interfaces/dto/syncWarehouseId.dto';
import { SyncInventoryDTO } from '../../src/interfaces/dto/syncInventory.dto';
import { Product } from '../../src/domain/product.entity';
import { ProductId } from '../../src/domain/productId.entity';
import { WarehouseId } from '../../src/domain/warehouseId.entity';
import { InventoryAggregated } from '../../src/domain/inventory-aggregated.entity';

describe('CloudDataMapper', () => {
  let mapper: CloudDataMapper;

  beforeEach(() => {
    mapper = new CloudDataMapper();
  });

  describe('toDomain', () => {
    it('should map SyncProductDTO to Product domain entity', () => {
      const syncProductIdDto = new SyncProductIdDTO();
      syncProductIdDto.id = 'prod-1';

      const syncWarehouseIdDto = new SyncWarehouseIdDTO();
      syncWarehouseIdDto.warehouseId = 1;

      const syncProductDto = new SyncProductDTO();
      syncProductDto.id = syncProductIdDto;
      syncProductDto.name = 'Test Product';
      syncProductDto.unitPrice = 100;
      syncProductDto.quantity = 50;
      syncProductDto.quantityReserved = 5;
      syncProductDto.minThres = 10;
      syncProductDto.maxThres = 100;
      syncProductDto.warehouseId = syncWarehouseIdDto;

      const product = mapper.toDomainProduct(syncProductDto);

      expect(product).toBeInstanceOf(Product);
      expect(product.getId().getId()).toBe('prod-1');
      expect(product.getName()).toBe('Test Product');
      expect(product.getWarehouseId().getId()).toBe(1);
    });

    it('should map SyncProductIdDTO to ProductId domain entity', () => {
      const syncProductIdDto = new SyncProductIdDTO();
      syncProductIdDto.id = 'prod-2';

      const productId = mapper.toDomainProductId(syncProductIdDto);

      expect(productId).toBeInstanceOf(ProductId);
      expect(productId.getId()).toBe('prod-2');
    });

    it('should map SyncWarehouseIdDTO to WarehouseId domain entity', () => {
      const syncWarehouseIdDto = new SyncWarehouseIdDTO();
      syncWarehouseIdDto.warehouseId = 2;

      const warehouseId = mapper.toDomainWarehouseId(syncWarehouseIdDto);

      expect(warehouseId).toBeInstanceOf(WarehouseId);
      expect(warehouseId.getId()).toBe(2);
    });

    it('should map SyncInventoryDTO to InventoryAggregated domain entity', () => {
      const syncProductIdDto = new SyncProductIdDTO();
      syncProductIdDto.id = 'prod-1';
      const syncWarehouseIdDto = new SyncWarehouseIdDTO();
      syncWarehouseIdDto.warehouseId = 1;
      const syncProductDto = new SyncProductDTO();
      syncProductDto.id = syncProductIdDto;
      syncProductDto.name = 'Test Product';
      syncProductDto.unitPrice = 100;
      syncProductDto.quantity = 50;
      syncProductDto.quantityReserved = 5;
      syncProductDto.minThres = 10;
      syncProductDto.maxThres = 100;
      syncProductDto.warehouseId = syncWarehouseIdDto;

      const syncInventoryDto = new SyncInventoryDTO();
      syncInventoryDto.productList = [syncProductDto];

      const inventory = mapper.toDomainInventoryAggregated(syncInventoryDto);

      expect(inventory).toBeInstanceOf(InventoryAggregated);
      expect(inventory.getInventory()).toHaveLength(1);
      expect(inventory.getInventory()[0]).toBeInstanceOf(Product);
      expect(inventory.getInventory()[0].getId().getId()).toBe('prod-1');
    });
  });

  describe('toDTO', () => {
    it('should map Product domain entity to SyncProductDTO', () => {
      const product = new Product(
        new ProductId('prod-3'),
        'Domain Product',
        150,
        75,
        10,
        15,
        150,
        new WarehouseId(3),
      );

      const syncProductDto = mapper.toDTOProduct(product);

      expect(syncProductDto.id.id).toBe('prod-3');
      expect(syncProductDto.name).toBe('Domain Product');
      expect(syncProductDto.warehouseId.warehouseId).toBe(3);
    });

    it('should map ProductId domain entity to SyncProductIdDTO', () => {
      const productId = new ProductId('prod-4');
      const syncProductIdDto = mapper.toDTOProductId(productId);
      expect(syncProductIdDto.id).toBe('prod-4');
    });

    it('should map WarehouseId domain entity to SyncWarehouseIdDTO', () => {
      const warehouseId = new WarehouseId(4);
      const syncWarehouseIdDto = mapper.toDTOWarehouseId(warehouseId);
      expect(syncWarehouseIdDto.warehouseId).toBe(4);
    });

    it('should map InventoryAggregated domain entity to SyncInventoryDTO', () => {
      const product = new Product(
        new ProductId('prod-5'),
        'Another Product',
        200,
        100,
        20,
        25,
        200,
        new WarehouseId(5),
      );
      const inventory = new InventoryAggregated([product]);

      const syncInventoryDto = mapper.toDTOInventoryAggregated(inventory);

      expect(syncInventoryDto.productList).toHaveLength(1);
      expect(syncInventoryDto.productList[0].id.id).toBe('prod-5');
      expect(syncInventoryDto.productList[0].name).toBe('Another Product');
    });
  });
});