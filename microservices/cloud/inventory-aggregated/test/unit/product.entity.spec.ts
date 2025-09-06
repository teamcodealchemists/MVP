import { Product } from '../../src/domain/product.entity';
import { ProductId } from '../../src/domain/productId.entity';
import { WarehouseId } from '../../src/domain/warehouseId.entity';

describe('Product', () => {
  let product: Product;

  beforeEach(() => {
    product = new Product(
      new ProductId('1'),
      'Test Product',
      100,
      10,
      2,
      5,
      50,
      new WarehouseId(1)
    );
  });

  it('should get all properties correctly', () => {
    expect(product.getId().getId()).toBe('1');
    expect(product.getName()).toBe('Test Product');
    expect(product.getUnitPrice()).toBe(100);
    expect(product.getQuantity()).toBe(10);
    expect(product.getQuantityReserved()).toBe(2);
    expect(product.getMinThres()).toBe(5);
    expect(product.getMaxThres()).toBe(50);
    expect(product.getWarehouseId().getId()).toBe(1);
  });

  it('should set name correctly', () => {
    product.setName('New Name');
    expect(product.getName()).toBe('New Name');
  });

  it('should set unit price correctly', () => {
    product.setUnitPrice(200);
    expect(product.getUnitPrice()).toBe(200);
  });

  it('should set quantity correctly', () => {
    product.setQuantity(15);
    expect(product.getQuantity()).toBe(15);
  });

  it('should set quantity reserved correctly', () => {
    product.setQuantityReserved(3);
    expect(product.getQuantityReserved()).toBe(3);
  });

  it('should set min threshold correctly', () => {
    product.setMinThres(7);
    expect(product.getMinThres()).toBe(7);
  });

  it('should set max threshold correctly', () => {
    product.setMaxThres(60);
    expect(product.getMaxThres()).toBe(60);
  });
});
