import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { InventoryService } from 'src/application/inventory.service';

@Controller()
export class CommandHandler {
  constructor(private readonly inventoryService: InventoryService) {}

  @MessagePattern(`api.warehouse.${process.env.WAREHOUSE_ID}.getHello`)
  getHello(): Promise<string> {
    return this.inventoryService.getHello();
  }
}
