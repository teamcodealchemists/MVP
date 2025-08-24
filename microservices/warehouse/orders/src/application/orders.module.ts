import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersRepositoryModule } from 'src/infrastructure/adapters/mongodb/orders.repository.module';
import { NatsModule } from '../interfaces/nats/nats.module';
import { OrdersController } from 'src/interfaces/orders.controller';

@Module({
  imports: [NatsModule, OrdersRepositoryModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
    