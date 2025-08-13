import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern(`api.warehouse.${process.env.WAREHOUSE_ID}.getHello`)
  getHello(): string {
    return this.appService.getHello();
  }
}
