import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { SyncOrderId } from '../../../../domain/syncOrderId.entity'
import { SyncOrderItemDetail } from '../../../../domain/syncOrderItemDetail.entity'
import { SyncOrderState } from '../../../../domain/syncOrderState.enum'

@Schema()
export class SyncSellOrder {
  @Prop({ required: true, unique: true })
  orderId: SyncOrderId;

  @Prop({ required: true })
  items: SyncOrderItemDetail[];

  @Prop({ required: true })
  orderState: SyncOrderState;

  @Prop({ required: true })
  creationDate: Date;

  @Prop({ required: true })
  warehouseDeparture: number;

  @Prop({ required: true })
  destinationAddress : string;
}

export type SyncSellOrderDocument = SyncSellOrder & Document;
export const SyncSellOrderSchema = SchemaFactory.createForClass(SyncSellOrder);
