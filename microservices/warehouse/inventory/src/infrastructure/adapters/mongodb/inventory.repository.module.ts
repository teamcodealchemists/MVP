import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryRepositoryMongo } from './inventory.repository.impl';
import { ProductSchema } from './schemas/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Product', schema: ProductSchema }]),
  ],
  providers: [
    {
      provide: 'INVENTORYREPOSITORY',
      useClass: InventoryRepositoryMongo,
    },
  ],
  exports: [
    'INVENTORYREPOSITORY',
    MongooseModule, 
  ],
})
export class InventoryRepositoryModule {}
