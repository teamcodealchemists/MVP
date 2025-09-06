import { InventoryAggregated } from '../../src/domain/inventory-aggregated.entity';
import { Product } from '../../src/domain/product.entity';
import { ProductId } from '../../src/domain/productId.entity';
import { WarehouseId } from '../../src/domain/warehouseId.entity';

describe('InventoryAggregated', () => {
  it('should add a product to the inventory', () => {
    const initialProduct = new Product(
      new ProductId('1'),
      'Product 1',
      100,
      10,
      0,
      5,
      50,
      new WarehouseId(1)
    );
    const inventory = new InventoryAggregated([initialProduct]);

    const newProduct = new Product(
      new ProductId('2'),
      'Product 2',
      200,
      5,
      0,
      2,
      20,
      new WarehouseId(1)
    );
    inventory.addProductItem(newProduct);

    const inventoryList = inventory.getInventory();
    expect(inventoryList.length).toBe(2);
    expect(inventoryList).toContain(initialProduct);
    expect(inventoryList).toContain(newProduct);
  });
});
