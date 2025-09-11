import { Module } from '@nestjs/common';
import { StateAggregateController } from '../interfaces/stateAggregate.controller';
import { StateAggregateService } from './stateAggregate.service';
import { NatsModule } from './../interfaces/nats/nats.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudStateRepositoryMongo } from './../infrastructure/adapters/mongodb/cloudState.repository.impl';
import { AccessController } from './../interfaces/access.controller';
import { CloudStateRepositoryModule } from './../infrastructure/adapters/mongodb/cloudState.repository.module';
import { OutboundService } from './../interfaces/outbound.service';
import { CloudStateEventAdapter } from './../infrastructure/adapters/cloudState.event.adapter';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    //MongooseModule.forRoot('mongodb://host.docker.internal:27017/state_aggregate'),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_DB || 'mongodb://host.docker.internal:27017/state_aggregate'),
    NatsModule,
    CloudStateRepositoryModule
  ],
  controllers: [StateAggregateController, AccessController],
  providers: [
    StateAggregateService,
    OutboundService,
    {
      provide: CloudStateEventAdapter,
      useFactory: (outboundService: OutboundService) => new CloudStateEventAdapter(outboundService),
      inject: [OutboundService],
    },
    { provide: 'CLOUDSTATEREPOSITORY', 
      useClass: CloudStateRepositoryMongo
    }
  ],
  exports: [OutboundService, CloudStateEventAdapter, StateAggregateService],
})
export class StateAggregateModule {}
