import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { WarehouseStateDTO } from 'src/interfaces/http/dto/warehouseStatedto';
import { InboundPortsAdapter } from 'src/infrastructure/adapters/InboundPortsAdapter';
import { OrderQuantityDTO } from 'src/interfaces/http/dto/orderQuantity.dto';
import { productDto } from 'src/interfaces/http/dto/product.dto';
import { warehouseIdDto } from 'src/interfaces/http/dto/warehouseId.dto';
import { OrderIdDTO } from 'src/interfaces/http/dto/orderId.dto';
import { OrderItemDTO } from 'src/interfaces/http/dto/orderItem.dto';
import { validateOrReject } from 'class-validator';
import { productIdDto } from 'src/interfaces/http/dto/productId.dto';

const logger = new Logger('centralSystemController');

@Controller()
export class centralSystemController {
  constructor(
    private readonly inboundPortsAdapter: InboundPortsAdapter,
  ) {}

  @MessagePattern('event.inventory.insufficientQuantity')
  async handleInsufficientQuantity(@Payload() data : any): Promise<void> {
    try {
      let oQ = new OrderQuantityDTO();
          oQ.id = new OrderIdDTO();
      oQ.id.id = data.id;

      oQ.items = data.items?.map((item: any) => {
        const orderItem = new OrderItemDTO();
        orderItem.itemId = item.itemId;
        orderItem.quantity = item.quantity;
        return orderItem;
      }) || [];

      await validateOrReject(oQ);
      const id = new warehouseIdDto();
      id.warehouseId = data.warehouseId;
      logger.log(`Received insufficientQuantity event with payload: ${JSON.stringify(oQ)}`);
      await this.inboundPortsAdapter.handleInsufficientQuantity(oQ,id);
    } catch (error) {
      logger.error(`Error handling insufficientQuantity event: ` + error );
    }
    return Promise.resolve();
  }

  @MessagePattern('event.inventory.criticalQuantity.min')
  async handleCriticalQuantityMin(@Payload() data: any): Promise<void> {
    try {
      const productDtoInstance = new productDto();
      productDtoInstance.id = new productIdDto();
      productDtoInstance.id.id = data.product?.id;
      productDtoInstance.name = data.product?.name;
      productDtoInstance.unitPrice = data.product?.unitPrice;
      productDtoInstance.quantity = data.product?.quantity;
      productDtoInstance.minThres = data.product?.minThres;
      productDtoInstance.maxThres = data.product?.maxThres;

      const warehouseDtoInstance = new warehouseIdDto();
      warehouseDtoInstance.warehouseId = data.product?.warehouseId;

      productDtoInstance.warehouseId = warehouseDtoInstance;
      await validateOrReject(productDtoInstance);
      logger.log(`Received criticalQuantity.min event with payload: ${JSON.stringify(productDtoInstance)}`);
      
      await this.inboundPortsAdapter.handleCriticalQuantityMin(productDtoInstance);
      return Promise.resolve();
    } catch (error) {
      logger.error(`Error handling criticalQuantity.min event:` + error);
      return Promise.resolve();
    }
  }


  @MessagePattern('event.inventory.criticalQuantity.max')
  async handleCriticalQuantityMax(@Payload() data: any): Promise<void> {
    try {
      const productDtoInstance = new productDto();
      productDtoInstance.id = new productIdDto();
      productDtoInstance.id.id = data.product?.id;
      productDtoInstance.name = data.product?.name;
      productDtoInstance.unitPrice = data.product?.unitPrice;
      productDtoInstance.quantity = data.product?.quantity;
      productDtoInstance.minThres = data.product?.minThres;
      productDtoInstance.maxThres = data.product?.maxThres;

      // Trasformazione warehouseId in DTO
      const warehouseDtoInstance = new warehouseIdDto();
      warehouseDtoInstance.warehouseId = data.product?.warehouseId; // assegni il numero al campo id

      productDtoInstance.warehouseId = warehouseDtoInstance;
      await validateOrReject(productDtoInstance);
      logger.log(`Received criticalQuantity.max event with payload: ${JSON.stringify(data)}`);
      await this.inboundPortsAdapter.handleCriticalQuantityMax(productDtoInstance);
      return Promise.resolve();
    } catch (error) {
      logger.error(`Error handling criticalQuantity.max event: ` + error);
      return Promise.resolve();
    }
  }

  @MessagePattern('event.inventory.getWarehouseState')
  async getWarehouseState(@Payload() data : any): Promise<void> {
    try {
      const warehouseDtos: WarehouseStateDTO[] = data.map((p) => {
      const dto = new WarehouseStateDTO();
      let temp =  new warehouseIdDto();
      temp.warehouseId = p?.warehouseId.id;
      dto.warehouseId = temp;
      dto.state = p?.state;
      return dto;
      });
      for (const dto of warehouseDtos) {
        await validateOrReject(dto);
      }
      logger.log(`Received getWarehouseState request with payload: ${JSON.stringify(warehouseDtos)}`);
      await this.inboundPortsAdapter.getWarehouseState(warehouseDtos);
    } catch (error) {
      logger.error(`Error handling getWarehouseState event:` + error);
    }
    return Promise.resolve();
  }
}
