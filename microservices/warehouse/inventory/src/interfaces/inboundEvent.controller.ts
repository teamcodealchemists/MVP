import { Controller, Logger } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { plainToInstance } from 'class-transformer';
import { InboundEventListener } from 'src/infrastructure/adapters/inbound-event.adapter';
import { ProductQuantityDto } from './dto/productQuantity.dto';
import { ProductQuantityArrayDto } from './dto/productQuantityArray.dto';
import { validateOrReject } from 'class-validator';
import { OrderIdDTO } from './dto/orderId.dto';
import { Product } from 'src/domain/product.entity';
import { ProductId } from 'src/domain/productId.entity';
import { ProductIdDto } from './dto/productId.dto';

const logger = new Logger('InboundEventController');
@Controller()
export class InboundEventController {
  constructor(private readonly inboundEventListener: InboundEventListener) { }
  @EventPattern(`event.warehouse.${process.env.WAREHOUSE_ID}.stock.addQuantity`)
  async handleAddQuantity(payload: any): Promise<void> {
    const data =
      typeof payload === 'string'
        ? payload
        : payload?.data
          ? payload.data.toString()
          : payload;

    try {
      const productObj = JSON.parse(data);

      const dto: ProductQuantityDto = {
        productId: productObj.id,
        quantity: productObj.quantity,
      };
      this.inboundEventListener.addQuantity(dto);
      logger.log(`Ricevuto evento addQuantity: ${JSON.stringify(dto)}`);
    } catch (err) {
      logger.error('Errore parsing addQuantity payload', err);
    }
  };

  @EventPattern(`event.warehouse.${process.env.WAREHOUSE_ID}.order.request`)
  async handleOrderRequest(@Payload() payload: any): Promise<void> {
    logger.fatal('handleOrderRequest payload:', payload);

    let dto = new ProductQuantityArrayDto();
    let orderDto = new OrderIdDTO();
    orderDto.id = payload.orderIdDTO.id;
    dto.id = orderDto;
    dto.productQuantityArray = payload.itemsDTO.map((item: any) => {
      const productIdDto = new ProductIdDto();
      productIdDto.id = item.itemId.id;
      return {
        productId: productIdDto,
        quantity: item.quantity,
      };
    });


    try {
      //validateOrReject(dto);
      this.inboundEventListener.orderRequest(dto);
    } catch (err) {
      logger.error('Errore parsing orderRequest payload', err);
    }
  }

  @EventPattern(`event.warehouse.${process.env.WAREHOUSE_ID}.inventory.ship.items`)
  async handleShipOrderRequest(@Payload() payload: any): Promise<void> {

    let dto = new ProductQuantityArrayDto();
    let orderDto = new OrderIdDTO();
    orderDto.id = payload.orderIdDTO.id;
    dto.id = orderDto;
    dto.productQuantityArray = payload.itemsDTO.map((item: any) => {
      const productIdDto = new ProductIdDto();
      productIdDto.id = item.itemId.id;
      return {
        productId: productIdDto,
        quantity: item.quantity,
      };
    });

    try {
      await validateOrReject(dto);
      this.inboundEventListener.shipOrderRequest(dto);
    } catch (err) {
      logger.error('Errore parsing orderRequest payload', err);
    }
  }
  @EventPattern(`event.warehouse.${process.env.WAREHOUSE_ID}.order.receiveShipment`)
  async handleReceiveShipment(payload: any): Promise<void> {
    const data =
      typeof payload === 'string'
        ? payload
        : payload?.data
          ? payload.data.toString()
          : payload;
    try {
      const parsed = JSON.parse(data);
      const dto = plainToInstance(ProductQuantityArrayDto, {
        productQuantityArray: parsed,
      });
      const errors = await validateOrReject(dto);
      logger.error('Validation failed for orderRequest:', errors);
      this.inboundEventListener.receiveShipment(dto);
    } catch (err) {
      logger.error('Errore parsing orderRequest payload', err);
    }
  }
}
