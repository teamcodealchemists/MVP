import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TokenListDocument = TokenListSchema & Document;

@Schema({ collection: 'tokenList' })
export class TokenListSchema {
    @Prop({ required: true, unique: true })
    sub: string;

    @Prop({ required: true })
    status: boolean;
}

export const TokenListSchemaFactory = SchemaFactory.createForClass(TokenListSchema);    