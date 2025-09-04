import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryService } from './inventory.service';
import { InventoryRepositoryModule } from 'src/infrastructure/adapters/mongodb/inventory.repository.module';
import { CommandHandler } from 'src/interfaces/commandHandler.controller';
import { InventoryRepositoryMongo } from 'src/infrastructure/adapters/mongodb/inventory.repository.impl';
import { OutboundEventAdapter } from 'src/infrastructure/adapters/outbound-event.adapter';
import { InboundEventListener } from 'src/infrastructure/adapters/inbound-event.listener';
import { ProductAddQuantityUseCase } from 'src/domain/use-cases/product-add-quantity.usecase';
import { OrderRequestUseCase } from 'src/domain/use-cases/order-request.usecase';

@Module({
  imports: [
    
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/inventorydb'), 
    InventoryRepositoryModule,
  ],
  controllers: [CommandHandler],
  providers: [ 
    InventoryService,
    ProductAddQuantityUseCase,  
    OrderRequestUseCase,
    {
      provide: 'INVENTORYREPOSITORY',
      useClass: InventoryRepositoryMongo,
    },
  ],
  exports: [InventoryService],
})
export class InventoryModule {}

