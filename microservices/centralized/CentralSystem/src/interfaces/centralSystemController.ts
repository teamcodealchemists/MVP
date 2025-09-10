import { Controller, Logger } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { WarehouseStateDTO } from 'src/interfaces/http/dto/warehouseState.dto';
import { InboundPortsAdapter } from 'src/infrastructure/adapters/InboundPortsAdapter';
import { OrderQuantityDTO } from 'src/interfaces/http/dto/orderQuantity.dto';
import { productDto } from 'src/interfaces/http/dto/product.dto';
import { warehouseIdDto } from 'src/interfaces/http/dto/warehouseId.dto';
import { OrderIdDTO } from 'src/interfaces/http/dto/orderId.dto';
import { OrderItemDTO } from 'src/interfaces/http/dto/orderItem.dto';
import { validateOrReject } from 'class-validator';
import { productIdDto } from 'src/interfaces/http/dto/productId.dto';
import { ItemIdDTO } from './http/dto/itemId.dto';

const logger = new Logger('centralSystemController');

@Controller()
export class centralSystemController {
  constructor(
    private readonly inboundPortsAdapter: InboundPortsAdapter,
  ) {}

  @EventPattern('event.warehouse.*.centralSystem.request')
    async handleInsufficientQuantity(@Payload() raw: any): Promise<void> {
      console.log('Arrivato in handleInsufficientQuantity');
      try {
        // se arriva come stringa fai il parse
        const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
        console.log('Payload parsed:', data);

        const oQ = new OrderQuantityDTO();

        // Mappa l'OrderIdDTO
        oQ.id = new OrderIdDTO();
        oQ.id.id = data.orderIdDTO.id;

        // Mappa gli itemsDTO
        oQ.items = data.itemsDTO?.map((item: any) => {
          const orderItem = new OrderItemDTO();
          orderItem.itemId = new ItemIdDTO();
          orderItem.itemId.id = item.itemId.id;
          orderItem.quantity = item.quantity;
          return orderItem;
        }) || [];

        await validateOrReject(oQ);

        // Mappa warehouseId
        const id = new warehouseIdDto();
        id.warehouseId = Number(data.warehouseId);
        await validateOrReject(id);
        logger.log(
          `Received insufficientQuantity event with payload: ${JSON.stringify(oQ)}, warehouseId=${id.warehouseId}`
        );

        await this.inboundPortsAdapter.handleInsufficientQuantity(oQ, id);
      } catch (error) {
        logger.error(`Error handling insufficientQuantity event: ` + error);
      }
      return Promise.resolve();
    }


  @EventPattern('event.inventory.criticalQuantity.min')
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


  @EventPattern('event.inventory.criticalQuantity.max')
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

  @EventPattern('event.inventory.getWarehouseState')
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
