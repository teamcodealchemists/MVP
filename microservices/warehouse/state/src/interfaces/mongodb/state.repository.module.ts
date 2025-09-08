import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StateSchema } from '../../infrastructure/adapters/mongodb/schemas/state.schema';
import { StateSchemaFactory } from '../../infrastructure/adapters/mongodb/schemas/state.schema';
import { StateSchemaName } from '../../infrastructure/adapters/mongodb/schemas/state.schema';
import { StateRepositoryMongo } from './state.repository.impl';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: StateSchemaName, schema: StateSchemaFactory }]),
  ],
  providers: [
    {
      provide: 'STATEREPOSITORY',
      useClass: StateRepositoryMongo,
    },
  ],
  exports: ['STATEREPOSITORY'],
})
export class StateRepositoryModule {}
