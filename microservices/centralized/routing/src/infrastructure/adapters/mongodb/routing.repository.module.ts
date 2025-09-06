import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoutingRepositoryMongo } from './routing.repository.impl';
import { RoutingSchema } from './schemas/routing.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Routing', schema: RoutingSchema }]),
  ],
  providers: [
    {
      provide: 'ROUTINGREPOSITORY',
      useClass: RoutingRepositoryMongo,
    },
  ],
  exports: [
    'ROUTINGREPOSITORY',
    MongooseModule, 
  ],
})
export class RoutingRepositoryModule {}
