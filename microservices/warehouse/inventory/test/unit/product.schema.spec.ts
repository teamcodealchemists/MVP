import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { model, Model } from 'mongoose';
import { Product, ProductDocument, ProductSchema } from '../../src/infrastructure/adapters/mongodb/schemas/product.schema';

describe('Product Schema', () => {
  let ProductModel: any;

  beforeAll(async () => {
    // Creiamo un modello Mongoose fittizio basato sullo schema
    ProductModel = model('ProductTest', ProductSchema);
  });

  it('should be defined', () => {
    expect(ProductModel).toBeDefined();
  });

  it('should create a new product instance', () => {
    const product = new ProductModel({
      id: 'p1',
      name: 'Product 1',
      unitPrice: 100,
      quantity: 10,
      quantityReserved: 2,
      minThres: 1,
      maxThres: 20,
    });

    expect(product.id).toBe('p1');
    expect(product.name).toBe('Product 1');
    expect(product.unitPrice).toBe(100);
    expect(product.quantity).toBe(10);
    expect(product.quantityReserved).toBe(2);
    expect(product.minThres).toBe(1);
    expect(product.maxThres).toBe(20);
  });

  it('should have required fields', () => {
    const keys = Object.keys(ProductSchema.obj);
    expect(keys).toEqual(
      expect.arrayContaining(['id', 'name', 'unitPrice', 'quantity', 'quantityReserved', 'minThres', 'maxThres']),
    );
  });
});
