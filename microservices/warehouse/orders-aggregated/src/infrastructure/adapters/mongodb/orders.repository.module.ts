import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { InternalOrderSchema } from './schemas/internalOrder.schema';
import { SellOrderSchema } from './schemas/sellOrder.schema';
import { OrderItemDetailSchema } from './schemas/orderItemDetail.schema';

import { OrdersRepositoryMongo } from './orders.repository.impl';
import { DataMapper } from "../../mappers/data.mapper";

@Module({
  imports: [
    MongooseModule.forFeature([
      { 
        name: 'InternalOrder', 
        schema: InternalOrderSchema,
        collection: 'internalOrders' 
      },
      { 
        name: 'SellOrder', 
        schema: SellOrderSchema, 
        collection: 'sellOrders' 
      },
      { 
        name: 'OrderItemDetail', 
        schema: OrderItemDetailSchema, 
        collection: 'orderItemDetails' 
      },
      ])
  ],
  controllers: [],
  providers: [
    {
      provide: "ORDERSREPOSITORY",
      useClass: OrdersRepositoryMongo,
    },
    DataMapper
  ],
  exports: ["ORDERSREPOSITORY"],
})
export class OrdersRepositoryModule {}
