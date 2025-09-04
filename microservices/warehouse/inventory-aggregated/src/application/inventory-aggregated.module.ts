import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryAggregatedService } from './inventory-aggregated.service';
import { InventoryAggregatedRepositoryImpl } from '../infrastructure/adapters/mongodb/inventory-aggregated.repository.impl';
import { SyncProduct } from '../infrastructure/adapters/mongodb/schemas/syncProduct.schema';
import { SyncProductSchema } from '../infrastructure/adapters/mongodb/schemas/syncProduct.schema';
import { CloudDataMapper } from '../infrastructure/mappers/cloud-data.mapper';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI!),
    MongooseModule.forFeature([{ name: SyncProduct.name, schema: SyncProductSchema }]),
  ],
  providers: [
    InventoryAggregatedService,
    CloudDataMapper,
    { 
      provide: 'INVENTORYREPOSITORY',
      useClass: InventoryAggregatedRepositoryImpl,
    },
  ],
  exports: [InventoryAggregatedService],
})
export class InventoryAggregatedModule {}
