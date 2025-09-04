import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StateSchema } from '../../infrastructure/adapters/mongodb/schemas/state.schema';
import { StateRepositoryMongo } from './state.repository.impl';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'State', schema: StateSchema }]),
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
