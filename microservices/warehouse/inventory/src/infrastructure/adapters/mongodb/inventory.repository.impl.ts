import { Inventory } from "src/domain/inventory.entity";
import { InventoryRepository } from "src/domain/inventory.repository";
import { Product } from "src/domain/product.entity";
import { ProductId } from "src/domain/productId.entity";
import { Injectable } from "@nestjs/common";
import {ProductQuantity} from 'src/domain/productQuantity.entity';


@Injectable()
export class InventoryRepositoryMongo implements InventoryRepository {
    // Implement the methods defined in the InventoryRepository interface
    async addProduct(product: Product): Promise<void> {
        // Implementation for adding a product to MongoDB
        return Promise.resolve();
    }

    async removeById(id: ProductId): Promise<boolean> {
        // Implementation for removing a product by ID from MongoDB
        return Promise.resolve(true);
    }

    async updateProduct(product: Product): Promise<void> {
        // Implementation for updating a product in MongoDB
        return Promise.resolve();
    }

    async getById(id: ProductId): Promise<Product> {
        // Implementation for getting a product by ID from MongoDB
        return Promise.resolve(new Product(new ProductId("1"),"Banana",0,0,0,0));
    }

    async getAllProducts(): Promise<Inventory> {
        return Promise.resolve(new Inventory([new Product(new ProductId("1"),"Banana",0,0,0,0)]));
    }

    async checkProductExistence(id: ProductId): Promise<boolean> {
        return Promise.resolve(true);
    }

    async checkProductThres(product: Product): Promise<boolean> {
    return Promise.resolve(true);
  }

   async checkProductAvailability(productQuantities: ProductQuantity[]): Promise<boolean> {
          return Promise.resolve(false);
      }
}
