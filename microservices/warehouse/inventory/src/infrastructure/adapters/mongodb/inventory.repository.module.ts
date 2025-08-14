import { Module } from '@nestjs/common';
import { InventoryRepositoryMongo } from './inventory.repository.impl';
import { InventoryRepository } from 'src/domain/inventory.repository';

@Module({
  imports: [],
  controllers: [],
  providers: [
    {
      provide: "INVENTORYREPOSITORY",
      useClass: InventoryRepositoryMongo,
    },
  ],
  exports: ["INVENTORYREPOSITORY"],
})
export class InventoryRepositoryModule {}
