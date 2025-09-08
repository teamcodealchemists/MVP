import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudStateRepositoryMongo } from './cloudState.repository.impl';
import { CloudStateSchema } from './schemas/cloudState.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'CloudState', schema: CloudStateSchema }]),
  ],
  providers: [
    {
      provide: 'CLOUDSTATEREPOSITORY',
      useClass: CloudStateRepositoryMongo,
    },
  ],
  exports: [
    'CLOUDSTATEREPOSITORY',
    MongooseModule, 
  ],
})
export class CloudStateRepositoryModule {}