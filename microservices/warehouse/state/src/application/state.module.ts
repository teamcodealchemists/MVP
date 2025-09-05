import { Module } from '@nestjs/common';
import { StateService } from './state.service';
import { StateRepositoryModule } from '../interfaces/mongodb/state.repository.module';
import { MongooseModule } from '@nestjs/mongoose';
import { StateController } from '../interfaces/state.controller';
import { InboundPortsAdapter } from '../infrastructure/adapters/portAdapters/inboundPortAdapters';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/state-db'),
    StateRepositoryModule,
  ],
  controllers: [StateController],       
  providers: [StateService, InboundPortsAdapter], 
  exports: [StateService],
})
export class StateModule {}
