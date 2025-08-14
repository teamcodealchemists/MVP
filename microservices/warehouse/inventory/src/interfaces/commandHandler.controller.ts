import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { InventoryService } from 'src/application/inventory.service';
import { ProductId } from 'src/domain/productId.entity';
import { removeProductCommand } from 'src/infrastructure/command/removeProductCommand';

@Controller()
export class CommandHandler {
  constructor(private readonly inventoryService: InventoryService) {}

  @MessagePattern(`api.warehouse.${process.env.WAREHOUSE_ID}.getHello`)
  getHello(): Promise<string> {
    let cmd = new removeProductCommand(this.inventoryService, new ProductId("1"));
    return cmd.execute();
  }


}
