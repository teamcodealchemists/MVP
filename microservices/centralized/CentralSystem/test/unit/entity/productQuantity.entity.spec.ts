import { ProductQuantity } from 'src/domain/productQuantity.entity';
import { ProductId } from 'src/domain/productId.entity';

describe('ProductQuantity Entity', () => {
  let productId: ProductId;
  let productQuantity: ProductQuantity;

  beforeEach(() => {
    productId = new ProductId('P1');
    productQuantity = new ProductQuantity(productId, 10);
  });

  it('should return the correct ProductId', () => {
    expect(productQuantity.getId()).toBe(productId);
  });

  it('should return the correct quantity', () => {
    expect(productQuantity.getQuantity()).toBe(10);
  });
});
