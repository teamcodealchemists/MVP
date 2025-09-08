import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { OrderItem } from '../../../../domain/orderItem.entity'


@Schema()
export class OrderItemDetail {
  @Prop({ required: true})
  items: OrderItem[];

  @Prop({ required: true })
  quantityReserved: number;
  
  @Prop({ required: true })
  unitPrice: number;
}

export type OrderItemDetailDocument = OrderItemDetail & Document;
export const OrderItemDetailSchema = SchemaFactory.createForClass(OrderItemDetail);
