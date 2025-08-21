import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { OrderId } from '../../../../domain/orderId.entity'
import { OrderItemDetail } from '../../../../domain/orderItemDetail.entity'
import { OrderState } from '../../../../domain/orderState.enum'

export type SellOrderDocument = SellOrderSchema & Document;

@Schema()
export class SellOrderSchema {
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
  destinationAddress : string;
}

export const SellOrderSchemaFactory = SchemaFactory.createForClass(SellOrderSchema);
