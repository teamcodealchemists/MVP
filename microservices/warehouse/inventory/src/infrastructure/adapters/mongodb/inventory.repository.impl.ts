import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Inventory } from 'src/domain/inventory.entity';
import { InventoryRepository } from 'src/domain/inventory.repository';
import { Product } from 'src/domain/product.entity';
import { ProductId } from 'src/domain/productId.entity';
import { ProductDocument } from './schemas/product.schema';
import { ProductQuantity } from 'src/domain/productQuantity.entity';
import { WarehouseId } from 'src/domain/warehouseId.entity';


@Injectable()
export class InventoryRepositoryMongo implements InventoryRepository {
  constructor(
    @InjectModel('Product') private readonly productModel: Model<ProductDocument>, 
  ) {} 

  async addProduct(product: Product): Promise<void> {
    const productValues = {
      id: product.getId().getId(),
      name: product.getName(),
      unitPrice: product.getUnitPrice(),
      quantity: product.getQuantity(),
      minThres: product.getMinThres(),
      maxThres: product.getMaxThres(),
    };

    const newProduct = new this.productModel(productValues);
    await newProduct.save();
  }
 
  async removeById(id: ProductId): Promise<boolean> {
    const result = await this.productModel.deleteOne({ id: id.getId() }).exec();
    return result.deletedCount > 0;
  }

  async updateProduct(product: Product): Promise<void> {
    await this.productModel.updateOne(
      { id: product.getId().getId() },
      {
        name: product.getName(),
        unitPrice: product.getUnitPrice(),
        quantity: product.getQuantity(),
        quantityReserved: product.getQuantityReserved(),
        minThres: product.getMinThres(),
        maxThres: product.getMaxThres(),
      },
    ).exec();
  }

  async getById(id: ProductId): Promise<Product | null> {
    const productDoc = await this.productModel.findOne({ id: id.getId() }).exec();
    if (!productDoc) return null;

    return new Product(
      productDoc.id,
      productDoc.name,
      productDoc.unitPrice,
      productDoc.quantity,
      productDoc.quantityReserved,
      productDoc.minThres,
      productDoc.maxThres
    );
  }

  async getAllProducts(): Promise<Inventory> {
    const productDocs = await this.productModel.find().exec();
    const products = productDocs.map(
      (doc) =>
        new Product(
          doc.id,
          doc.name,
          doc.unitPrice,
          doc.quantity,
          doc.quantityReserved,
          doc.minThres,
          doc.maxThres,
        ),
    );
    return new Inventory(products);
  }
}