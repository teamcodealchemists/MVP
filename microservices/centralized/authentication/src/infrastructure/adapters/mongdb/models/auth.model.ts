import { Model } from 'mongoose';
import { AuthenticationDocument } from '../schemas/auth.schema';

export type AuthenticationModel = Model<AuthenticationDocument>;