import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = ProductSchema & Document;

@Schema()
export class ProductSchema {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  unitPrice: number;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  minThres: number;

  @Prop({ required: true })
  maxThres: number;
}

export const ProductSchemaFactory = SchemaFactory.createForClass(ProductSchema);
