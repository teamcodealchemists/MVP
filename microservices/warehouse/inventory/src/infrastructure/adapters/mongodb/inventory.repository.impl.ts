import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Inventory } from 'src/domain/inventory.entity';
import { InventoryRepository } from 'src/domain/inventory.repository';
import { Product } from 'src/domain/product.entity';
import { ProductId } from 'src/domain/productId.entity';
import { ProductDocument } from './schemas/product.schema';
import { ProductQuantity } from 'src/domain/productQuantity.entity';


@Injectable()
export class InventoryRepositoryMongo implements InventoryRepository {
  constructor(
    @InjectModel('Product') private readonly productModel: Model<ProductDocument>, 
  ) {}

  async addProduct(product: Product): Promise<void> {
    try {
      const productValues = {
        id: product.getId(),
        name: product.getName(),
        unitPrice: product.getUnitPrice(),
        quantity: product.getQuantity(),
        minThres: product.getMinThres(),
        maxThres: product.getMaxThres(),
      };

      const newProduct = new this.productModel(productValues);
      await newProduct.save();
    } catch (error) {
      console.error('Errore durante l\'aggiunta del prodotto:', error);
      throw error;
    }
  }

  async removeById(id: ProductId): Promise<boolean> {
    try {
      const result = await this.productModel.deleteOne({ id: id.getId() }).exec();
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Errore durante la rimozione del prodotto:', error);
      throw error;
    }
  }

  async updateProduct(product: Product): Promise<void> {
    try {
      await this.productModel.updateOne(
        { id: product.getId() }, 
        {
          name: product.getName(),
          unitPrice: product.getUnitPrice(),
          quantity: product.getQuantity(),
          minThres: product.getMinThres(),
          maxThres: product.getMaxThres(),
        },
      ).exec();
    } catch (error) {
      console.error('Errore durante l\'aggiornamento del prodotto:', error);
      throw error;
    }
  }

  async getById(id: ProductId): Promise<Product | null> {
    try {
      const productDoc = await this.productModel.findOne({ id: id.getId() }).exec();
      if (!productDoc) return null;

      return new Product(
        productDoc.id,
        productDoc.name,
        productDoc.unitPrice,
        productDoc.quantity,
        productDoc.minThres,
        productDoc.maxThres,
      );
    } catch (error) {
      console.error('Errore durante la ricerca del prodotto per ID:', error);
      throw error;
    }
  }

  async getAllProducts(): Promise<Inventory> {
    try {
      const productDocs = await this.productModel.find().exec();
      const products = productDocs.map(
        (doc) =>
          new Product(
            doc.id,
            doc.name,
            doc.unitPrice,
            doc.quantity,
            doc.minThres,
            doc.maxThres,
          ),
      );
      return new Inventory(products);
    } catch (error) {
      console.error('Errore durante la ricerca di tutti i prodotti:', error);
      throw error;
    }
  }

  async checkProductExistence(id: ProductId): Promise<boolean> {
    try {
      const product = await this.productModel.findOne({ id: id.getId() }).exec();
      return !!product;
    } catch (error) {
      console.error('Errore durante la verifica dell\'esistenza del prodotto:', error);
      throw error;
    }
  }

  async checkProductThres(product: Product): Promise<boolean> {
    try {
      const productDoc = await this.productModel.findOne({ id: product.getId() }).exec();

      if (!productDoc) {
        console.log("Non ho trovato il prodotto");
        return false;
      }

      return (
        product.getQuantity() >= product.getMinThres() &&
        product.getQuantity() <= product.getMaxThres()
      );
    } catch (error) {
      console.error('Errore durante la verifica delle soglie del prodotto:', error);
      throw error;
    }
  }

async checkProductAvailability(productQuantities: ProductQuantity[]): Promise<boolean> {
  try {
    for (const pq of productQuantities) {
      const productDoc = await this.productModel.findOne({ id: pq.getId() }).exec(); 
      if (!productDoc) {
        console.log("Non ho trovato il prodotto");
        return false;
      }
      if (productDoc.quantity < pq.getQuantity()) {
        console.log("Quantità non disponibile");
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error('Errore durante la verifica disponibilità:', error);
    throw error;
  }
}
}
