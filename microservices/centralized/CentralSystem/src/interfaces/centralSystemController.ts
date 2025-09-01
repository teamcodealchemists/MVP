import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { InboundPortsAdapter } from 'src/infrastructure/adapters/centralSystemController';

import { OrderQuantityDTO } from 'src/interfaces/http/dto/orderQuantity.dto';
import { productDto } from 'src/interfaces/http/dto/product.dto';
import { warehouseIdDto } from 'src/interfaces/http/dto/warehouseId.dto';
import { WarehouseStateDTO } from 'src/interfaces/http/dto/warehouseState.dto';

const logger = new Logger('InventoryController');

@Controller()
export class centralSystemController {
  constructor(
    private readonly inboundPortsAdapter: InboundPortsAdapter,
  ) {}

  @MessagePattern('event.inventory.insufficientQuantity')
  async handleInsufficientQuantity(@Payload() oQ: OrderQuantityDTO, id : warehouseIdDto): Promise<void> {
    try {
      logger.log(`Received insufficientQuantity event with payload: ${JSON.stringify(oQ)}`);
      await this.inboundPortsAdapter.handleInsufficientQuantity(oQ,id);
    } catch (error) {
      logger.error(`Error handling insufficientQuantity event: ${error?.message}`, error?.stack);
    }
  }

  @MessagePattern('event.inventory.criticalQuantity.min')
  async handleCriticalQuantityMin(@Payload() data: { product: productDto; warehouse: warehouseIdDto }): Promise<void> {
    try {
      logger.log(`Received criticalQuantity.min event with payload: ${JSON.stringify(data)}`);
      await this.inboundPortsAdapter.handleCriticalQuantityMin(data.product, data.warehouse);
    } catch (error) {
      logger.error(`Error handling criticalQuantity.min event: ${error?.message}`, error?.stack);
    }
  }

  @MessagePattern('event.inventory.criticalQuantity.max')
  async handleCriticalQuantityMax(@Payload() data: { product: productDto; warehouse: warehouseIdDto }): Promise<void> {
    try {
      logger.log(`Received criticalQuantity.max event with payload: ${JSON.stringify(data)}`);
      await this.inboundPortsAdapter.handleCriticalQuantityMax(data.product, data.warehouse);
    } catch (error) {
      logger.error(`Error handling criticalQuantity.max event: ${error?.message}`, error?.stack);
    }
  }

  @MessagePattern('event.inventory.getWarehouseState')
  async getWarehouseState(@Payload() warehouseState: WarehouseStateDTO[]): Promise<void> {
    try {
      logger.log(`Received getWarehouseState request with payload: ${JSON.stringify(warehouseState)}`);
      await this.inboundPortsAdapter.getWarehouseState(warehouseState);
    } catch (error) {
      logger.error(`Error handling getWarehouseState event: ${error?.message}`, error?.stack);
    }
  }
}
