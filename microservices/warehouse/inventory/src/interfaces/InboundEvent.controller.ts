import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { InventoryService } from 'src/application/inventory.service';
import { productDto } from './dto/product.dto';
import { productIdDto } from './dto/productId.dto';
import { DataMapper } from '../infrastructure/mappers/dataMapper';
import { plainToInstance } from 'class-transformer';
import { Product } from 'src/domain/product.entity';
import { Inventory } from 'src/domain/inventory.entity';
import { Payload } from '@nestjs/microservices';
import { OutboundEventAdapter } from 'src/infrastructure/adapters/outbound-event.adapter';
import { WarehouseId } from 'src/domain/warehouseId.entity';
import { InboundEventListener } from 'src/infrastructure/adapters/inbound-event.adapter';

const logger = new Logger('InboundEventController');
@Controller()
export class InboundEventController {
  constructor(private readonly inboundEventListener : InboundEventListener) { }
  @MessagePattern(`api.warehouse.1.newStock`)
  async handleAddQuantity(payload: any): Promise<void> {

  };

  @MessagePattern(`api.warehouse.1.newStock`)
  async handleOrderRequest(payload: any): Promise<void> {

  }

}
