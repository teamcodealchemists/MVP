import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudOrdersService } from './cloud.orders.service';
import { CloudDataMapper } from '../infrastructure/mappers/cloud.data.mapper';
import { CloudOrdersRepositoryModule } from 'src/infrastructure/adapters/mongodb/cloud.orders.repository.module';
import { NatsModule } from '../interfaces/nats/nats.module';
import { CloudOrdersController } from 'src/interfaces/cloudOrders.controller';
import { CloudInboundPortsAdapter } from 'src/infrastructure/adapters/cloudInboundPorts.adapter';
import { CloudOutboundEventAdapter } from 'src/infrastructure/adapters/cloudOutboundEvent.adapter';
import { AccessController } from 'src/interfaces/access.controller';

import { TelemetryModule } from '../telemetry/telemetry.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://mongo:27017/orders-aggregated',
    ),
    NatsModule,
    CloudOrdersRepositoryModule,
    TelemetryModule,
  ],
  controllers: [CloudOrdersController, AccessController],
  providers: [
    CloudInboundPortsAdapter,
    CloudOrdersService,
    CloudDataMapper,
    CloudOutboundEventAdapter,
  ],
})
export class CloudOrdersModule {}
