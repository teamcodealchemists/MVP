import { DataMapper } from '../../src/infrastructure/mappers/dataMapper';
import { ProductQuantityArrayDto } from '../../src/interfaces/dto/productQuantityArray.dto';
import { ProductId } from '../../src/domain/productId.entity';
import { ProductQuantity } from '../../src/domain/productQuantity.entity';
import { OrderId } from '../../src/domain/orderId.entity';
import { Inventory } from '../../src/domain/inventory.entity';
import { Product } from '../../src/domain/product.entity';
import { ProductIdDto } from '../../src/interfaces/dto/productId.dto';

describe('DataMapper', () => {
  describe('toDomainProductQuantityArray', () => {
    it('should map ProductQuantityArrayDto to domain orderId and ProductQuantity array', () => {
      const dto: ProductQuantityArrayDto = {
        id: { id: 'order1' },
        productQuantityArray: [
          { productId: { id: 'p1' }, quantity: 5 },
          { productId: { id: 'p2' }, quantity: 3 },
        ],
      };

      const result = DataMapper.toDomainProductQuantityArray(dto);

      expect(result.orderId).toBeInstanceOf(OrderId);
      expect(result.orderId.getId()).toBe('order1');

      expect(result.productQuantities).toHaveLength(2);
      expect(result.productQuantities[0]).toBeInstanceOf(ProductQuantity);
      expect(result.productQuantities[0].getId().getId()).toBe('p1');
      expect(result.productQuantities[0].getQuantity()).toBe(5);
      expect(result.productQuantities[1].getId().getId()).toBe('p2');
      expect(result.productQuantities[1].getQuantity()).toBe(3);
    });
  });

  describe('toDTOProductId', () => {
    it('should map ProductId to ProductIdDto', () => {
      const productId = new ProductId('p1');
      const dto = DataMapper.toDTOProductId(productId);

      expect(dto).toEqual({ id: 'p1' });
    });
  });

  describe('toDtoInventory', () => {
    it('should map Inventory domain to InventoryDto', () => {
      process.env.WAREHOUSE_ID = '1';

      const products = [
        new Product(new ProductId('p1'), 'Product 1', 100, 10, 2, 1, 20),
        new Product(new ProductId('p2'), 'Product 2', 50, 5, 0, 0, 10),
      ];

      const inventory = new Inventory(products);
      const dto = DataMapper.toDtoInventory(inventory);

      expect(dto.productList).toHaveLength(2);
      expect(dto.productList[0]).toEqual({
        id: { id: 'p1' },
        name: 'Product 1',
        unitPrice: 100,
        quantity: 10,
        quantityReserved: 2,
        minThres: 1,
        maxThres: 20,
        warehouseId: { warehouseId: 1 },
      });

      expect(dto.productList[1]).toEqual({
        id: { id: 'p2' },
        name: 'Product 2',
        unitPrice: 50,
        quantity: 5,
        quantityReserved: 0,
        minThres: 0,
        maxThres: 10,
        warehouseId: { warehouseId: 1 },
      });
    });
  });
});
