import { Inventory } from "./inventory.entity";
import { Product } from "./product.entity";
import { ProductId } from "./productId.entity";
import { ProductQuantity } from "./productQuantity.entity";


export interface InventoryRepository {
    getById(id: ProductId): Promise<Product | null>;
    getAllProducts(): Promise<Inventory>;
    addProduct(product: Product): Promise<void>;
    removeById(id: ProductId): Promise<boolean>;
    updateProduct(editedProduct: Product): Promise<void>;
}

export const InventoryRepository = Symbol("INVENTORYREPOSITORY");