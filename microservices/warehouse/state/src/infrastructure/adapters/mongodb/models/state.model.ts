import { Model } from 'mongoose';
import { StateDocument } from '../schemas/state.schema';

export type StateModel = Model<StateDocument>;
