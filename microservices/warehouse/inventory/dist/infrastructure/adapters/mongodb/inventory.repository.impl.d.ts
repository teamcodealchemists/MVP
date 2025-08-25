import { Model } from 'mongoose';
import { Inventory } from 'src/domain/inventory.entity';
import { InventoryRepository } from 'src/domain/inventory.repository';
import { Product } from 'src/domain/product.entity';
import { ProductId } from 'src/domain/productId.entity';
import { ProductDocument } from './schemas/product.schema';
export declare class InventoryRepositoryMongo implements InventoryRepository {
    private readonly productModel;
    constructor(productModel: Model<ProductDocument>);
    addProduct(product: Product): Promise<void>;
    removeById(id: ProductId): Promise<boolean>;
    updateProduct(product: Product): Promise<void>;
    getById(id: ProductId): Promise<Product | null>;
    getAllProducts(): Promise<Inventory>;
}
