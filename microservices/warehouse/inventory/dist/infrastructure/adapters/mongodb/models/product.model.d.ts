import { Model } from 'mongoose';
import { ProductDocument } from '../schemas/product.schema';
export type ProductModel = Model<ProductDocument>;
