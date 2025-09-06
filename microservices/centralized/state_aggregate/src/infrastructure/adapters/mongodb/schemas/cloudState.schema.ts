import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CloudStateDocument = CloudState & Document;

@Schema()
export class CloudState {
    @Prop({ required: true, unique: true })
    cloudWarehouseId: number;

    @Prop({ required: true })
    state: string;
}

export const CloudStateSchema = SchemaFactory.createForClass(CloudState);
