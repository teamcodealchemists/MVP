import { Inventory } from 'src/domain/inventory.entity';
import { Product } from 'src/domain/product.entity';
import { ProductId } from 'src/domain/productId.entity';
import { WarehouseId } from 'src/domain/warehouseId.entity';

describe('Inventory Entity', () => {
  let inventory: Inventory;
  let product1: Product;
  let product2: Product;

  beforeEach(() => {
    product1 = new Product(
      new ProductId('1'),
      'Prodotto 1',
      10,   
      5,    
      2,    
      100,  
      new WarehouseId(1)
    );

    product2 = new Product(
      new ProductId('2'),
      'Prodotto 2',
      20,
      15,
      5,
      200,
      new WarehouseId(2)
    );

    inventory = new Inventory([product1, product2]);
  });

  it('should return all products via getInventory', () => {
    const products = inventory.getInventory();
    expect(products.length).toBe(2);
    expect(products).toContain(product1);
    expect(products).toContain(product2);
  });

  it('should add a new product via addProductItem', () => {
    const newProduct = new Product(
      new ProductId('3'),
      'Prodotto 3',
      30,
      50,
      10,
      300,
      new WarehouseId(1)
    );

    inventory.addProductItem(newProduct);

    const products = inventory.getInventory();
    expect(products.length).toBe(3);
    expect(products).toContain(newProduct);
  });
});
