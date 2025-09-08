import { Module } from '@nestjs/common';
import { StateService } from './state.service';
import { StateRepositoryModule } from '../interfaces/mongodb/state.repository.module';
import { MongooseModule } from '@nestjs/mongoose';
import { StateController } from '../interfaces/state.controller';
import { InboundPortsAdapter } from '../infrastructure/adapters/portAdapters/inboundPortAdapters';
import { StateEventHandler } from '../interfaces/state-event.handler';
import { NatsClientModule } from '../interfaces/nats/natsClientModule/natsClient.module';
import { OutboundPortsAdapter } from '../infrastructure/adapters/portAdapters/outboundPortAdapters';
@Module({
  imports: [
    MongooseModule.forRoot(`${process.env.MONGO_URI}`),
    NatsClientModule,
    StateRepositoryModule,
  ],
  controllers: [StateController],       
  providers: [StateService, InboundPortsAdapter, StateEventHandler, OutboundPortsAdapter], 
  exports: [StateService],
})
export class StateModule {}
