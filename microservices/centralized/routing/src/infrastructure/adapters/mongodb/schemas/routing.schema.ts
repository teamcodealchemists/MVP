import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RoutingDocument = Routing & Document;

@Schema()
export class Routing {
  @Prop({ required: true, unique: true })
  warehouseId: number;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  address: string;
}

export const RoutingSchema = SchemaFactory.createForClass(Routing);