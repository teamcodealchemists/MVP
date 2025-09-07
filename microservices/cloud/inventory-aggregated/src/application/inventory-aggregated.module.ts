import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryAggregatedService } from './inventory-aggregated.service';
import { InventoryAggregatedRepositoryImpl } from '../infrastructure/adapters/mongodb/inventory-aggregated.repository.impl';
import { SyncProduct } from '../infrastructure/adapters/mongodb/schemas/syncProduct.schema';
import { SyncProductSchema } from '../infrastructure/adapters/mongodb/schemas/syncProduct.schema';
import { CloudDataMapper } from '../infrastructure/mappers/cloud-data.mapper';
import { CommandHandler } from 'src/interfaces/commandHandler.controller';
import { CloudInventoryEventAdapter } from 'src/infrastructure/adapters/inventory-aggregated-event.adapter';
import { AccessController } from 'src/interfaces/access.controller';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI!),
    MongooseModule.forFeature([{ name: SyncProduct.name, schema: SyncProductSchema }]),
  ],
  providers: [
    InventoryAggregatedService,
    CloudInventoryEventAdapter,
    CloudDataMapper,
    { 
      provide: 'INVENTORYREPOSITORY',
      useClass: InventoryAggregatedRepositoryImpl,
    },
  ],
  controllers: [CommandHandler, AccessController],
  exports: [InventoryAggregatedService],
})
export class InventoryAggregatedModule {}
