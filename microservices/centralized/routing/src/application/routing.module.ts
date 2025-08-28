import { Module } from '@nestjs/common';
import { RoutingController } from './../interfaces/routing.controller';
import { RoutingService } from './routing.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RoutingRepositoryModule } from 'src/infrastructure/adapters/mongodb/routing.repository.module';
import { OutboundService } from 'src/interfaces/outbound.service';
import { RoutingEventAdapter } from 'src/infrastructure/adapters/routing.event.adapter';
import { RoutingRepositoryMongo } from 'src/infrastructure/adapters/mongodb/routing.repository.impl';
import { NatsModule } from 'src/interfaces/nats/nats.module';
import { RoutingRepository } from 'src/domain/routing.repository';


@Module({
  imports: [
    // Importa moduli necessari, ad esempio per il database
    MongooseModule.forRoot('mongodb://host.docker.internal:27017/routing'),
    RoutingRepositoryModule,
    NatsModule,
  ],
  controllers: [RoutingController],
  providers: [
    RoutingService,
    OutboundService,
    RoutingEventAdapter,
    {
      provide: 'ROUTINGREPOSITORY',
      useClass: RoutingRepositoryMongo,
    },
  ],
  exports: [RoutingService],
})
export class RoutingModule {}
