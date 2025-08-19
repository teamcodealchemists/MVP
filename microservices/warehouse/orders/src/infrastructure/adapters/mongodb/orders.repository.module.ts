import { Module } from '@nestjs/common';
import { OrdersRepositoryMongo } from './orders.repository.impl';
import { OrdersRepository } from 'src/domain/orders.repository';

@Module({
  imports: [],
  controllers: [],
  providers: [
    {
      provide: "ORDERSREPOSITORY",
      useClass: OrdersRepositoryMongo,
    },
  ],
  exports: ["ORDERSREPOSITORY"],
})
export class OrdersRepositoryModule {}
