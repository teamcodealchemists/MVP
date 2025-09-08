import { Injectable } from '@nestjs/common';

import { SyncOrderStatusEventPublisher } from '../../interfaces/outbound-ports/syncOrderStatusEvent.publisher';
import { SyncOrderUpdateEventPublisher } from '../../interfaces/outbound-ports/syncOrderUpdateEvent.publisher'; 
import { AllProductsPublisher } from '../../interfaces/outbound-ports/allProducts.publisher'; 

import { NatsService } from '../../interfaces/nats/nats.service';
import { CloudDataMapper } from '../mappers/cloud.data.mapper';

import { SyncOrder } from "src/domain/syncOrder.entity";
import { SyncOrders } from "src/domain/syncOrders.entity";
import { SyncOrderId } from "src/domain/syncOrderId.entity";

@Injectable()
export class CloudOutboundEventAdapter implements SyncOrderStatusEventPublisher, SyncOrderUpdateEventPublisher, AllProductsPublisher
 { 

  constructor(private readonly natsService: NatsService,
      private readonly dataMapper: CloudDataMapper) {}

  // AGGIORNARE I PUBLISH SUBJECT
  
  async orderUpdated(order: SyncOrder) {
    await this.natsService.publish('orders.updated', order);
  } 

  async publishAllProducts(orders: SyncOrders) {
    await this.natsService.publish('get.warehouse.orders.publish.all', orders);
  } 

  async orderCancelled(orderId: SyncOrderId, warehouse: number) {
   try {
      const orderIdStr = orderId.getId();

      let aggregateSubject  = `call.aggregate.order.cancel`;
      let warehouseSubject  = `call.order.${orderIdStr}.cancel`;

      await this.natsService.publish( aggregateSubject, { orderId: orderIdStr });
      await this.natsService.publish( warehouseSubject, { orderId: orderIdStr });

    } catch (error) {
        console.error('Errore in orderCancelled:', error);
        throw error;
    }
  }

  async orderCompleted(orderId: SyncOrderId, warehouse: number) {
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

}