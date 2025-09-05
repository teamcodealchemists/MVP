import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class SyncProduct extends Document {
  @Prop({ required: true })
  warehouseId!: string;

  @Prop({ required: true })
  productId!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  unitPrice!: number;

  @Prop({ required: true })
  quantity!: number;

  @Prop({ required: true })
  minThres!: number;

  @Prop({ required: true })
  maxThres!: number;
}

export const SyncProductSchema = SchemaFactory.createForClass(SyncProduct);
