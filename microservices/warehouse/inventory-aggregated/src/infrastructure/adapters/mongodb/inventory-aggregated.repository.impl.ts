import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../../../domain/product.entity';
import { InventoryAggregatedRepository } from '../../../domain/inventory-aggregated.repository';
import { SyncProduct } from './schemas/syncProduct.schema';
import { CloudDataMapper } from '../../mappers/cloud-data.mapper';
import { ProductId } from '../../../domain/productId.entity';
import { WarehouseId } from '../../../domain/warehouseId.entity';

@Injectable()
export class InventoryAggregatedRepositoryImpl implements InventoryAggregatedRepository {
  constructor(
    @InjectModel(SyncProduct.name) private readonly productModel: Model<SyncProduct>,
  ) {}

  async addProduct(product: Product): Promise<void> {
    const doc = new this.productModel({
      warehouseId: product.getWarehouseId(),
      id: product.getId(),
      name: product.getName(),
      unitPrice: product.getUnitPrice(),
      quantity: product.getQuantity(),
      minThres: product.getMinThres(),
      maxThres: product.getMaxThres(),
    });
    await doc.save();
  }

   async removeById(id: string): Promise<boolean> {
    const result = await this.productModel.deleteOne({ id }).exec();
    return result.deletedCount > 0;
  }



async updateProduct(id: string, product: Product): Promise<void> {
  await this.productModel.updateOne({ id }, {
    name: product.getName(),
    unitPrice: product.getUnitPrice(),
    quantity: product.getQuantity(),
    minThres: product.getMinThres(),
    maxThres: product.getMaxThres(),
    warehouseId: product.getWarehouseId(),
  }).exec();
}

async getById(id: string): Promise<Product | null> {
  const productDoc = await this.productModel.findOne({ id }).exec();
  if (!productDoc) return null;

  return new Product(
    new ProductId(productDoc.id),
    productDoc.name,
    productDoc.unitPrice,
    productDoc.quantity,
    productDoc.minThres,
    productDoc.maxThres,
    new WarehouseId(productDoc.warehouseId),
  );
}


  async getAllProducts(): Promise<Product[]> {
    const docs = await this.productModel.find().exec();
    return docs.map(doc => new Product(
      new ProductId(doc.id),
      doc.name,
      doc.unitPrice,
      doc.quantity,
      doc.minThres,
      doc.maxThres,
      new WarehouseId(doc.warehouseId)
    ));
  }
}