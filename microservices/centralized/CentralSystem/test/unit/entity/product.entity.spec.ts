import { Product } from '../../../src/domain/product.entity';
import { ProductId } from '../../../src/domain/productId.entity';
import { WarehouseId } from '../../../src/domain/warehouseId.entity';

describe('Product Entity - getters and setters', () => {
  let product: Product;

  beforeEach(() => {
    const productId = new ProductId("1");
    const warehouseId = new WarehouseId(100);

    product = new Product(
      productId,
      'Initial Product',
      10.5,
      20,
      5,
      50,
      warehouseId,
    );
  });

  it('should return the correct name with getName', () => {
    expect(product.getName()).toBe('Initial Product');
  });

  it('should update the name with setName', () => {
    product.setName('Updated Product');
    expect(product.getName()).toBe('Updated Product');
  });

  it('should update the unitPrice with setUnitPrice', () => {
    product.setUnitPrice(99.99);
    expect(product.getUnitPrice()).toBe(99.99);
  });

  it('should update the quantity with setQuantity', () => {
    product.setQuantity(200);
    expect(product.getQuantity()).toBe(200);
  });

  it('should update the minThres with setMinThres', () => {
    product.setMinThres(15);
    expect(product.getMinThres()).toBe(15);
  });

  it('should update the maxThres with setMaxThres', () => {
    product.setMaxThres(500);
    expect(product.getMaxThres()).toBe(500);
  });
});
