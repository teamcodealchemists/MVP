import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StateDocument = StateSchema & Document;
export const StateSchemaName = 'State';

@Schema({ collection: 'states' })
export class StateSchema {
  @Prop({ required: true })
  warehouseId!: number;

  @Prop({ required: true })
  state!: string;

  @Prop()
  lastHeartbeat?: Date;

  @Prop()
  lastHeartbeatMsg?: string;
}

export const StateSchemaFactory = SchemaFactory.createForClass(StateSchema);
