import { Inventory } from 'src/domain/inventory.entity';
import { Product } from 'src/domain/product.entity';
import { ProductId } from 'src/domain/productId.entity';
import { InventoryRepository } from 'src/domain/inventory.repository';
import { ProductQuantity } from 'src/domain/productQuantity.entity';
export declare class InventoryService {
    private readonly inventoryRepository;
    private readonly warehouseId;
    constructor(inventoryRepository: InventoryRepository);
    addProduct(newProduct: Product): Promise<void>;
    removeProduct(id: ProductId): Promise<boolean>;
    editProduct(editedProduct: Product): Promise<void>;
    getProduct(id: ProductId): Promise<Product>;
    getInventory(): Promise<Inventory>;
    getWarehouseId(): Promise<string>;
    checkProductExistence(id: ProductId): Promise<boolean>;
    checkProductThres(product: Product): Promise<boolean>;
    checkProductAvailability(productQuantities: ProductQuantity[]): Promise<boolean>;
}
