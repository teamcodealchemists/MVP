import { Module } from '@nestjs/common';
import { RoutingController } from './../interfaces/routing.controller';
import { RoutingService } from './routing.service';

@Module({
  imports: [],
  controllers: [RoutingController],
  providers: [RoutingService],
})
export class RoutingModule {}
