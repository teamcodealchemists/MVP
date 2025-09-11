import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryService } from './inventory.service';
import { InventoryRepositoryModule } from 'src/infrastructure/adapters/mongodb/inventory.repository.module';
import { CommandHandler } from 'src/interfaces/commandHandler.controller';
import { InventoryRepositoryMongo } from 'src/infrastructure/adapters/mongodb/inventory.repository.impl';
import { OutboundEventAdapter } from 'src/infrastructure/adapters/outbound-event.adapter';
import { InboundEventListener } from 'src/infrastructure/adapters/inbound-event.adapter';
import { AccessController } from 'src/interfaces/access.controller';
import { InboundEventController } from 'src/interfaces/inboundEvent.controller';
import { OutboundEventHandler } from 'src/interfaces/outboundEventHandler';
import { NatsClientModule } from 'src/interfaces/nats/natsClientModule/natsClient.module';


@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/inventorydb'), 
    InventoryRepositoryModule,
    NatsClientModule
  ],
  controllers: [CommandHandler, AccessController, InboundEventController],
  providers: [
    OutboundEventAdapter,
    OutboundEventHandler,
    InboundEventListener,
    InventoryService,
    {
      provide: 'INVENTORYREPOSITORY',
      useClass: InventoryRepositoryMongo,
    },
  ],
  exports: [InventoryService],
})
export class InventoryModule {}

