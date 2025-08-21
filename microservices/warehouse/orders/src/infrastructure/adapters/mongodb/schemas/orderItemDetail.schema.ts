import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { OrderItem } from '../../../../domain/orderItem.entity'

export type OrderItemDetailDocument = OrderItemDetailSchema & Document;

@Schema()
export class OrderItemDetailSchema {
  @Prop({ required: true})
  items: OrderItem[];

  @Prop({ required: true })
  quantityReserved: number;
  
  @Prop({ required: true })
  unitPrice: number;
}

export const OrderItemDetailSchemaFactory = SchemaFactory.createForClass(OrderItemDetailSchema);
