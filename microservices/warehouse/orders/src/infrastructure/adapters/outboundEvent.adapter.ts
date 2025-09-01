import { MessagePattern } from '@nestjs/microservices';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { connect, NatsConnection, JSONCodec } from 'nats';
import { NatsService } from '../../interfaces/nats/nats.service';

import { OrdersService } from 'src/application/orders.service';
import { DataMapper } from '../../infrastructure/mappers/data.mapper';

import { Order } from "src/domain/order.entity";
import { Orders } from "src/domain/orders.entity";
import { OrderItem } from "src/domain/orderItem.entity";
import { OrderItemDetail } from "src/domain/orderItemDetail.entity";
import { OrderState } from "src/domain/orderState.enum";

import { OrderId } from "src/domain/orderId.entity";
import { InternalOrder } from "src/domain/internalOrder.entity";
import { SellOrder } from "src/domain/sellOrder.entity";

@Injectable()
export class OutboundEventAdapter { 
  constructor(private readonly ordersService: OrdersService,
    private readonly natsService: NatsService,
      private readonly dataMapper: DataMapper) {}

  // (Deduco) Corrisponde in PUB a replenishmentReceived()
  async publishReserveStock(orderId: OrderId, items: OrderItem[]) {
      await this.natsService.publish(
          `call.warehouse.${process.env.WAREHOUSE_ID}.order.replenishment.received`, 
          { 
              id: orderId.getId()  // Solo l'ID string
          }
      );
  }

  // Corrisponde in SUB a stockShipped()
  async publishShipment(orderId: OrderId, items: OrderItem[]) {
      await this.natsService.publish(
          `call.warehouse.${process.env.WAREHOUSE_ID}.order.stock.shipped`, 
          { 
              id: orderId.getId()  // Solo l'ID string
          }
      );
  }

  // Corrisponde in SUB a stockReceived()
  async receiveShipment(orderId: OrderId, items: OrderItem[], destination: number) {
      await this.natsService.publish(
          `call.warehouse.${destination}.order.stock.received`, 
          { 
              id: orderId.getId()  // Solo l'ID string
          }
      );
  }
  // Corrisponde in SUB a stockReserved()
  async publishStockRepl(orderId: OrderId, items: OrderItem[]) {
      // Converti gli OrderItem in formato DTO per il payload
      const itemsDTO = items.map(item => ({
          itemId: { id: item.getItemId() },
          quantity: item.getQuantity()
      }));
      
      await this.natsService.publish(
          `call.warehouse.${process.env.WAREHOUSE_ID}.order.stock.reserved`, 
          { 
              id: { id: orderId.getId() },  // OrderIdDTO
              items: itemsDTO               // OrderItemDTO[]
          }
      );
  }

/* async orderUpdated(order: Order) {
    await this.natsService.publish('orders.updated', order);
  } */

  async orderCancelled(orderId: OrderId, warehouse: number) {
   try {
      const orderIdStr = orderId.getId();

      let aggregateSubject  = `call.aggregate.order.cancel`;
      let warehouseSubject  = `call.warehouse.${warehouse}.order.${orderIdStr}.cancel`;

      await this.natsService.publish( aggregateSubject, { orderId: orderIdStr });
      await this.natsService.publish( warehouseSubject, { orderId: orderIdStr });

    } catch (error) {
        console.error('Errore in orderCancelled:', error);
        throw error;
    }
  }

  async orderCompleted(orderId: OrderId, warehouse: number) {
   try {
      const orderIdStr = orderId.getId();

      let aggregateSubject  = `call.aggregate.order.complete`;
      let warehouseSubject  = `call.warehouse.${warehouse}.order.${orderIdStr}.complete`;

      await this.natsService.publish( aggregateSubject, { orderId: orderIdStr });
      await this.natsService.publish( warehouseSubject, { orderId: orderIdStr });

    } catch (error) {
        console.error('Errore in orderCompleted:', error);
        throw error;
    }
  }

  async publishInternalOrder(internalOrder: InternalOrder, context: { destination: 'aggregate' | 'warehouse', warehouseId?: number }) {

    const { orderIdDTO, internalOrderDTO }  = await this.dataMapper.internalOrderToDTO(internalOrder);
    let subject: string;

    if (context.destination === 'aggregate') {
      subject = `call.aggregate.${context.destination}.order.internal.new`;
      await this.natsService.publish( subject, { orderIdDTO, internalOrderDTO });
    } 
      else if (context.destination === 'warehouse' && context.warehouseId) {
        subject = `call.warehouse.${context.warehouseId}.order.internal.new`;
        await this.natsService.publish( subject, { orderIdDTO, internalOrderDTO });
      }
    
  }

  async publishSellOrder(sellOrder: SellOrder, context: { destination: 'aggregate' | 'warehouse', warehouseId?: number } ) {

    const { orderIdDTO, sellOrderDTO }  = await this.dataMapper.sellOrderToDTO(sellOrder);
    let subject: string;

    if (context.destination === 'aggregate') {
      subject = `call.aggregate.${context.destination}.order.sell.new`;
      
      await this.natsService.publish( subject, { orderIdDTO, sellOrderDTO });
    } 
      else if (context.destination === 'warehouse' && context.warehouseId) {
        subject = `call.warehouse.${context.warehouseId}.order.sell.new`;
        await this.natsService.publish( subject, { orderIdDTO, sellOrderDTO });
      }
    
  }

}