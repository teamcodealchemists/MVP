import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryRepositoryModule } from 'src/infrastructure/adapters/mongodb/inventory.repository.module';
import { CommandHandler } from 'src/interfaces/commandHandler.controller';

@Module({
  imports: [InventoryRepositoryModule],
  controllers: [CommandHandler],
  providers: [InventoryService],
})
export class InventoryModule {}
    