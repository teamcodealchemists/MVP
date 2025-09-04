import { Module } from '@nestjs/common';
import { StateAggregateController } from '../interfaces/stateAggregate.controller';
import { StateAggregateService } from './stateAggregate.service';
import { NatsModule } from 'src/interfaces/nats/nats.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudStateRepositoryMongo } from 'src/infrastructure/adapters/mongodb/cloudState.repository.impl';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://host.docker.internal:27017/state_aggregate'),
    NatsModule
  ],
  controllers: [StateAggregateController],
  providers: [
    StateAggregateService,
    { provide: 'CLOUDSTATEREPOSITORY', 
      useClass: CloudStateRepositoryMongo
    }
  ],
})
export class StateAggregateModule {}
