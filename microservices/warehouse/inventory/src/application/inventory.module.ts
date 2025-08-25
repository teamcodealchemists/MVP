import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryService } from './inventory.service';
import { InventoryRepositoryModule } from 'src/infrastructure/adapters/mongodb/inventory.repository.module';
import { CommandHandler } from 'src/interfaces/commandHandler.controller';
import { InventoryRepositoryMongo } from 'src/infrastructure/adapters/mongodb/inventory.repository.impl';
import { OutboundEventAdapter } from 'src/infrastructure/adapters/outbound-event.adapter';
import { InboundEventListener } from 'src/infrastructure/adapters/inbound-event.listener';

@Module({
  imports: [
    
    MongooseModule.forRoot('mongodb://localhost:27017/inventorydb'), 
    InventoryRepositoryModule,
  ],
  controllers: [CommandHandler],
  providers: [
    InventoryService,
    OutboundEventAdapter,
    InboundEventListener,
    {
      provide: 'INVENTORYREPOSITORY',
      useClass: InventoryRepositoryMongo,
    },
  ],
  exports: [InventoryService],
})
export class InventoryModule {}

