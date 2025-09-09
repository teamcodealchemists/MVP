import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SyncInternalOrderSchema } from './schemas/syncInternalOrder.schema';
import { SyncSellOrderSchema } from './schemas/syncSellOrder.schema';
import { SyncOrderItemDetailSchema } from './schemas/syncOrderItemDetail.schema';

import { CloudOrdersRepositoryMongo } from './cloud.orders.repository.impl';
import { CloudDataMapper } from "../../mappers/cloud.data.mapper";

@Module({
  imports: [
    MongooseModule.forFeature([
      { 
        name: 'SyncInternalOrder', 
        schema: SyncInternalOrderSchema,
        collection: 'syncInternalOrders' 
      },
      { 
        name: 'SyncSellOrder', 
        schema: SyncSellOrderSchema, 
        collection: 'syncSellOrders' 
      },
      { 
        name: 'SyncOrderItemDetail', 
        schema: SyncOrderItemDetailSchema, 
        collection: 'syncOrderItemDetails' 
      },
      ])
  ],
  controllers: [],
  providers: [
    {
      provide: "CLOUDORDERSREPOSITORY",
      useClass: CloudOrdersRepositoryMongo,
    },
    CloudDataMapper
  ],
  exports: ["CLOUDORDERSREPOSITORY"],
})
export class CloudOrdersRepositoryModule {}
