import { Module } from '@nestjs/common';
import { RoutingController } from './../interfaces/routing.controller';
import { RoutingService } from './routing.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RoutingRepositoryModule } from './../infrastructure/adapters/mongodb/routing.repository.module';
import { OutboundService } from './../interfaces/outbound.service';
import { RoutingEventAdapter } from './../infrastructure/adapters/routing.event.adapter';
import { RoutingRepositoryMongo } from './../infrastructure/adapters/mongodb/routing.repository.impl';
import { NatsModule } from './../interfaces/nats/nats.module';
import { RoutingRepository } from './../domain/routing.repository';
import { AccessController } from './../interfaces/access.controller';


@Module({
  imports: [
    // Importa moduli necessari, ad esempio per il database
    MongooseModule.forRoot('mongodb://host.docker.internal:27017/routing'),
    RoutingRepositoryModule,
    NatsModule,
  ],
  controllers: [RoutingController, AccessController],
  providers: [
    RoutingService,
    OutboundService,
    RoutingEventAdapter,
    {
      provide: 'ROUTINGREPOSITORY',
      useClass: RoutingRepositoryMongo,
    },
  ],
  exports: [RoutingService,RoutingEventAdapter],
})
export class RoutingModule {}
