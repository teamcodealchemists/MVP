import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { OrderId } from '../../../../domain/orderId.entity'
import { OrderItemDetail } from '../../../../domain/orderItemDetail.entity'
import { OrderState } from '../../../../domain/orderState.enum'

@Schema()
export class InternalOrder {
  @Prop({ required: true, unique: true })
  orderId: OrderId;

  @Prop({ required: true })
  items: OrderItemDetail[];

  @Prop({ required: true })
  orderState: OrderState;

  @Prop({ required: true })
  creationDate: Date;

  @Prop({ required: true })
  warehouseDeparture: number;
  
  @Prop({ required: true })
  warehouseDestination: number;
}

export type InternalOrderDocument = InternalOrder & Document;
export const InternalOrderSchema = SchemaFactory.createForClass(InternalOrder);