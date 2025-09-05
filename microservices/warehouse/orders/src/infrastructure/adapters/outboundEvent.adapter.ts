import { Injectable } from '@nestjs/common';

import { InternalOrderEventPublisher } from '../../interfaces/outbound-ports/internalOrderEvent.publisher';
import { OrderStatusEventPublisher } from '../../interfaces/outbound-ports/orderStatusEvent.publisher';
/* import { OrderUpdateEventPublisher } from '../../interfaces/outbound-ports/orderUpdateEvent.publisher'; */
import { RequestStockReplenishmentPublisher } from '../../interfaces/outbound-ports/requestStockReplenishment.publisher';
import { ReserveStockCommandPublisher } from '../../interfaces/outbound-ports/reserveStockCommand.publisher';
import { SellOrderEventPublisher } from '../../interfaces/outbound-ports/sellOrderEvent.publisher';
import { ShipStockCommandPublisher } from '../../interfaces/outbound-ports/shipStockCommand.publisher';

import { NatsService } from '../../interfaces/nats/nats.service';
import { DataMapper } from '../../infrastructure/mappers/data.mapper';

import { OrderItem } from "src/domain/orderItem.entity";

import { OrderId } from "src/domain/orderId.entity";
import { InternalOrder } from "src/domain/internalOrder.entity";
import { SellOrder } from "src/domain/sellOrder.entity";
import { OrderState } from "src/domain/orderState.enum";

@Injectable()
export class OutboundEventAdapter implements InternalOrderEventPublisher, OrderStatusEventPublisher, RequestStockReplenishmentPublisher, ReserveStockCommandPublisher, 
SellOrderEventPublisher, ShipStockCommandPublisher { 

  constructor(private readonly natsService: NatsService,
      private readonly dataMapper: DataMapper) {}

      
  // (Deduco) Corrisponde in PUB a STOCKRESERVED
  async publishReserveStock(orderId: OrderId, items: OrderItem[]) {
    // Invia alla porta handleOrderRequest in Inventory del magazzino stesso
      await this.natsService.publish(
          `event.warehouse.${process.env.WAREHOUSE_ID}.order.request`, { orderId, items });
  }


  // Corrisponde in SUB a stockShipped()
/*   async publishShipment(orderId: OrderId, items: OrderItem[]) {
      await this.natsService.publish(
          `call.warehouse.${process.env.WAREHOUSE_ID}.order.stock.shipped`, 
          { 
              id: orderId.getId()  // ID string
          }
      );
  }
 */

  async publishShipment(orderId: OrderId, items: OrderItem[]): Promise<void> {
      // Comunica a Inventario di spedire la merce
      await this.natsService.publish(
          `call.warehouse.${process.env.WAREHOUSE_ID}.inventory.ship.items`, 
          {
              orderId: orderId.getId(),
              items: items.map(item => ({
                  itemId: item.getItemId(),
                  quantity: item.getQuantity()
              }))
          }
      );
  }


  // Corrisponde in SUB a stockReceived()
  async receiveShipment(orderId: OrderId, items: OrderItem[], destination: number) {
      await this.natsService.publish(
          `call.warehouse.${destination}.order.stock.received`, 
          { 
              id: orderId.getId()  // ID string
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
  async orderStateUpdated (orderId: OrderId, orderState: OrderState) {
   try {
      const orderIdStr = orderId.getId();
      // Sincronizza con l'aggregato
      let aggregateSubject  = `call.aggregate.order.${orderIdStr}.state.update.${orderState}`;
      await this.natsService.publish(aggregateSubject, "");

    } catch (error) {
        console.error('Errore in orderStateUpdated:', error);
        throw error;
    }
  }

  async orderCancelled(orderId: OrderId) {
   try {
      const orderIdStr = orderId.getId();
      // Sincronizza con l'aggregato
      let aggregateSubject  = `call.aggregate.order.${orderIdStr}.cancel`;
      await this.natsService.publish(aggregateSubject, "");

    } catch (error) {
        console.error('Errore in orderCancelled:', error);
        throw error;
    }
  }


  async orderCompleted(orderId: OrderId) {
   try {
      const orderIdStr = orderId.getId();
      // Sincronizza con l'aggregato
      let aggregateSubject  = `call.aggregate.order.${orderIdStr}.complete`;
      await this.natsService.publish(aggregateSubject, "");

    } catch (error) {
        console.error('Errore in orderCompleted:', error);
        throw error;
    }
  }


  async publishInternalOrder(internalOrder: InternalOrder, context: { destination: 'aggregate' | 'warehouse', warehouseId?: number }) {

    const internalOrderDTO  = await this.dataMapper.internalOrderToDTO(internalOrder);
    let subject: string;
    console.log("[outbound] Manda InternalOrder,", JSON.stringify(internalOrderDTO, null, 2));

    if (context.destination === 'aggregate') {
      subject = `call.aggregate.order.internal.new`;
      await this.natsService.publish( subject, internalOrderDTO );
    } /* 
      else if (context.destination === 'warehouse' && context.warehouseId) {
        subject = `call.warehouse.${context.warehouseId}.order.internal.new`;
        await this.natsService.publish( subject,  internalOrderDTO );
      } */
  }


  async publishSellOrder(sellOrder: SellOrder, context: { destination: 'aggregate' | 'warehouse', warehouseId?: number } ) {

    const sellOrderDTO  = await this.dataMapper.sellOrderToDTO(sellOrder);
    let subject: string;

    if (context.destination === 'aggregate') {
      subject = `call.aggregate.order.sell.new`;
      await this.natsService.publish( subject, sellOrderDTO );
    } /* 
      else if (context.destination === 'warehouse' && context.warehouseId) {
        subject = `call.warehouse.${context.warehouseId}.order.sell.new`;
        await this.natsService.publish( subject, sellOrderDTO );
      } */
    
  }

}