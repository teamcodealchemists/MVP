import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuthenticationDocument = UserSchema & Document;

@Schema()
export class UserSchema {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  surname: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  isGlobal: boolean;

  @Prop({ required: false })
  warehouseAssigned: number[];
}

export const AuthenticationSchema = SchemaFactory.createForClass(UserSchema);
