import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { SyncOrderItem } from '../../../../domain/syncOrderItem.entity'


@Schema()
export class SyncOrderItemDetail {
  @Prop({ required: true})
  items: SyncOrderItem[];

  @Prop({ required: true })
  quantityReserved: number;
  
  @Prop({ required: true })
  unitPrice: number;
}

export type SyncOrderItemDetailDocument = SyncOrderItemDetail & Document;
export const SyncOrderItemDetailSchema = SchemaFactory.createForClass(SyncOrderItemDetail);
