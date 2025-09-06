import { ProductQuantity } from '../../src/domain/productQuantity.entity'
import { ProductId } from '../../src/domain/productId.entity';

describe('ProductQuantity', () => {
  it('should create an instance with correct values', () => {
    const productId = new ProductId('123');
    const quantity = 50;

    const productQuantity = new ProductQuantity(productId, quantity);

    expect(productQuantity.getId()).toBe(productId);
    expect(productQuantity.getQuantity()).toBe(quantity);
  });
});
