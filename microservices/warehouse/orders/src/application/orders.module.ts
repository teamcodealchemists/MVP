import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { DataMapper } from '../infrastructure/mappers/data.mapper';
import { OrdersRepositoryModule } from 'src/infrastructure/adapters/mongodb/orders.repository.module';
import { NatsModule } from '../interfaces/nats/nats.module';
import { OrdersController } from 'src/interfaces/orders.controller';
import { OutboundEventAdapter } from 'src/infrastructure/adapters/outboundEvent.adapter';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://mongo:27017/orders'),
    NatsModule, 
    OrdersRepositoryModule],
  controllers: [OrdersController],
  providers: [OrdersService, DataMapper, OutboundEventAdapter],
})
export class OrdersModule {}
    