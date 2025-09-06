import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../../../domain/product.entity';
import { InventoryAggregatedRepository } from '../../../domain/inventory-aggregated.repository';
import { SyncProduct } from './schemas/syncProduct.schema';
import { CloudDataMapper } from '../../mappers/cloud-data.mapper';
import { ProductId } from '../../../domain/productId.entity';
import { WarehouseId } from '../../../domain/warehouseId.entity';
import { InventoryAggregated } from 'src/domain/inventory-aggregated.entity';

@Injectable()
export class InventoryAggregatedRepositoryImpl implements InventoryAggregatedRepository {
  constructor(
    @InjectModel(SyncProduct.name) private readonly productModel: Model<SyncProduct>,
  ) {}

  async addProduct(product: Product): Promise<void> {
    const doc = new this.productModel({
      warehouseId: product.getWarehouseId(),
      productId: product.getId(),
      name: product.getName(),
      unitPrice: product.getUnitPrice(),
      quantity: product.getQuantity(),
      quantityReserved: product.getQuantityReserved(),
      minThres: product.getMinThres(),
      maxThres: product.getMaxThres(),
    });
    await doc.save();
  }

   async removeById(id: ProductId): Promise<void> {
    await this.productModel.deleteOne({ id: id.getId() }).exec();
  }

async updateProduct(product: Product): Promise<void> {
  await this.productModel.updateOne({ productId: product.getId() }, {
    name: product.getName(),
    unitPrice: product.getUnitPrice(),
    quantity: product.getQuantity(),
    quantityReserved: product.getQuantityReserved(),
    minThres: product.getMinThres(),
    maxThres: product.getMaxThres(),
    warehouseId: product.getWarehouseId(),
  }).exec();
}

async getById(id: ProductId): Promise<Product | null> {
  const productDoc = await this.productModel.findOne({ productId: id.getId() }).exec();
  if (!productDoc) return null;

  return Promise.resolve(new Product(
    new ProductId(productDoc.id),
    productDoc.name,
    productDoc.unitPrice,
    productDoc.quantity,
    productDoc.quantityReserved,
    productDoc.minThres,
    productDoc.maxThres,
    new WarehouseId(Number(productDoc.warehouseId)),
  ));
}

  async getAllProducts(): Promise<InventoryAggregated> {
    const docs = await this.productModel.aggregate([
      {
        $group: {
          _id: "$name",
          productIds: { $addToSet: "$productId" },
          unitPrice: { $sum: "$unitPrice" },
          quantity: { $sum: "$quantity" },
          quantityReserved: { $sum: "$quantityReserved" },
          minThres: { $first: "$minThres" },
          maxThres: { $first: "$maxThres" }
        }
      }
    ]).exec();

    return Promise.resolve(new InventoryAggregated(
      docs.map(doc => new Product(
        // Use the first productId for the aggregated product
        new ProductId(doc.productIds[0]),
        doc._id, // name
        doc.unitPrice,
        doc.quantity,
        doc.quantityReserved,
        doc.minThres,
        doc.maxThres,
        new WarehouseId(0), // Aggregated, no specific warehouse
      ))
    ));
  }

  async getAll(): Promise<InventoryAggregated> {
    const docs = await this.productModel.find().exec();

    const products = docs.map(productDoc => new Product(
      new ProductId(productDoc.productId),
      productDoc.name,
      productDoc.unitPrice,
      productDoc.quantity,
      productDoc.quantityReserved,
      productDoc.minThres,
      productDoc.maxThres,
      new WarehouseId(Number(productDoc.warehouseId)),
    ));

    return Promise.resolve(new InventoryAggregated(products));
  }
}