import { Controller, Logger  } from '@nestjs/common';
import { MessagePattern, Payload, Ctx, EventPattern } from '@nestjs/microservices';
import { RpcException } from '@nestjs/microservices';

import { OrderQuantityDTO } from "src/interfaces/dto/orderQuantity.dto";
import { OrderIdDTO } from "src/interfaces/dto/orderId.dto";
import { OrderStateDTO } from "src/interfaces/dto/orderState.dto";

import { InternalOrderDTO } from "src/interfaces/dto/internalOrder.dto";
import { SellOrderDTO } from "src/interfaces/dto/sellOrder.dto";
import { OrdersDTO } from "src/interfaces/dto/orders.dto";

import { InboundPortsAdapter } from '../infrastructure/adapters/inboundPorts.adapter';


@Controller()
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(
    private readonly inboundPortsAdapter: InboundPortsAdapter,
  ) {}

  // Riceve la chiamata da magazzino di partenza di updatare la quantityReserved 
  // RICEVE DAL PUB DI PUBLISHRESERVESTOCK()
  @MessagePattern(`call.warehouse.${process.env.WAREHOUSE_ID}.order.stock.reserved`)
  async stockReserved(@Payload() orderQuantityDTO: OrderQuantityDTO): Promise<void> {
    await this.inboundPortsAdapter.stockReserved(orderQuantityDTO);
  }

  @MessagePattern(`call.warehouse.${process.env.WAREHOUSE_ID}.order.sell.new`)
  async addSellOrder(@Payload('params') payload: any): Promise<string> {
    try {
      const sellOrderDTO: SellOrderDTO = {
        orderId: payload.orderId,
        items: payload.items,
        orderState: payload.orderState,
        creationDate: payload.creationDate,
        warehouseDeparture: payload.warehouseDeparture,
        destinationAddress: payload.destinationAddress
      };
      let newOrderId = await this.inboundPortsAdapter.addSellOrder(sellOrderDTO);
      let RID = `warehouse.${process.env.WAREHOUSE_ID}.order.${newOrderId}`;
      return Promise.resolve(JSON.stringify({ resource: { rid: RID } }));
    } catch (error) {
        return Promise.resolve(JSON.stringify({ error: { code: 'system.internalError', message: error?.message || 'Unknown error' } }));
    }
  }

  @MessagePattern(`call.warehouse.${process.env.WAREHOUSE_ID}.order.internal.new`)
  async addInternalOrder(@Payload('params') payload: any): Promise<string> {
    try {
    const internalOrderDTO: InternalOrderDTO = {
      orderId: payload.orderId,
      items: payload.items,
      orderState: payload.orderState,
      creationDate: payload.creationDate,
      warehouseDeparture: payload.warehouseDeparture,
      warehouseDestination: payload.warehouseDestination,
      sellOrderReference : payload.sellOrderReference ?? "",
    };
    let newOrderId = await this.inboundPortsAdapter.addInternalOrder(internalOrderDTO);
    let RID = `warehouse.${process.env.WAREHOUSE_ID}.order.${newOrderId}`;
      return Promise.resolve(JSON.stringify({ resource: { rid: RID } }));
    } catch (error) {
      return Promise.resolve(JSON.stringify({ error: { code: 'system.internalError', message: error?.message || 'Unknown error' } }));
    }
  }

  @EventPattern(`event.warehouse.${process.env.WAREHOUSE_ID}.order.internal.new`)
  async addInternalOrderEvent(@Payload() payload: any): Promise<string> {
    Logger.log('📦 Nuovo evento di ordine interno ricevuto:', JSON.stringify(payload, null, 2));
    try {
    const internalOrderDTO: InternalOrderDTO = {
      orderId: payload.orderId,
      items: payload.items,
      orderState: payload.orderState,
      creationDate: payload.creationDate,
      warehouseDeparture: payload.warehouseDeparture,
      warehouseDestination: payload.warehouseDestination,
      sellOrderReference : payload.sellOrderReference ?? "",
    };
    let newOrderId = await this.inboundPortsAdapter.addInternalOrder(internalOrderDTO);
    let RID = `warehouse.${process.env.WAREHOUSE_ID}.order.${newOrderId}`;
      return Promise.resolve(JSON.stringify({ resource: { rid: RID } }));
    } catch (error) {
      return Promise.resolve(JSON.stringify({ error: { code: 'system.internalError', message: error?.message || 'Unknown error' } }));
    }
  }
  
  // Riceve il messaggio dall'Inventario del magazzino di partenza dove dice che ha tutta la merce
  @EventPattern(`warehouse.${process.env.WAREHOUSE_ID}.order.sufficientAvailability`)
  async sufficientProductAvailability(@Payload() payload : any): Promise<void> {
      this.logger.debug('1️⃣ Sufficient product availability received for order:', payload.orderId.id);

      let orderIdDTO = new OrderIdDTO();
      orderIdDTO.id = payload.orderId.id;
      await this.inboundPortsAdapter.sufficientProductAvailability(orderIdDTO);
  }

  @EventPattern(`event.warehouse.${process.env.WAREHOUSE_ID}.order.*.waitingStock`)
  async waitingForStock(@Ctx() context: any): Promise<void> {
    this.logger.debug('[1] Waiting for stock for order:', context.getSubject());
    const tokens = context.getSubject().split('.');
    const orderId = tokens[4];
    await this.inboundPortsAdapter.waitingForStock(orderId);
  }

  @EventPattern(`warehouse.${process.env.WAREHOUSE_ID}.order.*.stockShipped`)
  async stockShipped(@Ctx() context: any): Promise<void> {
    const tokens = context.getSubject().split('.');
    const orderId = tokens[3];
    this.logger.debug(`5️⃣ Stock shipped for order: ${orderId}`);
    await this.inboundPortsAdapter.stockShipped(orderId);
  }

  @EventPattern(`warehouse.${process.env.WAREHOUSE_ID}.order.*.stockReceived`)
  async stockReceived(@Ctx() context: any): Promise<void> {
    const tokens = context.getSubject().split('.');
    const orderId = tokens[3];

    const orderIdDto = new OrderIdDTO();
    orderIdDto.id = orderId;
    Logger.log('6️⃣ Stock received event for order:'+ orderId, "Order Controller");
    await this.inboundPortsAdapter.stockReceived(orderIdDto);
  }

  // Messaggio ricevuto dal servizio di riassortimento
  @MessagePattern(`call.warehouse.${process.env.WAREHOUSE_ID}.order.*.replenishment.received`)
  async replenishmentReceived(@Ctx() context: any): Promise<void> {
    console.log('✅ Sono arrivato qua in replenishmentReceived');
    const tokens = context.getSubject().split('.');
    const orderId = new OrderIdDTO();
    orderId.id = tokens[tokens.length - 3];
    await this.inboundPortsAdapter.replenishmentReceived(orderId);
  }

  @MessagePattern(`call.warehouse.${process.env.WAREHOUSE_ID}.order.*.state.update.*`)
  async updateOrderState(@Ctx() context: any): Promise<string> {
    try {
      const tokens = context.getSubject().split('.');
      const orderId = tokens[4];
      const orderState = tokens[7];
      await this.inboundPortsAdapter.updateOrderState(orderId, orderState);
      return Promise.resolve(JSON.stringify({ result: { message: `Order ${orderId} state updated to ${orderState}` } }));
    } catch (error) {
        return Promise.resolve(JSON.stringify({ error: { code: 'system.internalError', message: error?.message || 'Unknown error' } }));
    }
  }

  @EventPattern(`event.warehouse.${process.env.WAREHOUSE_ID}.order.*.state.update.*`)
  async updateOrderStateEvent(@Ctx() context: any): Promise<void> {
    try {
      const tokens = context.getSubject().split('.');
      const orderId = tokens[4];
      const orderState = tokens[7];
      Logger.log(`🔄 Aggiornamento stato ordine ${orderId} a ${orderState} da evento.`, "Order Controller");
      await this.inboundPortsAdapter.updateOrderState(orderId, orderState);
    } catch (error) {
        throw new Error(error.message);
    }
  }

  @MessagePattern(`call.warehouse.${process.env.WAREHOUSE_ID}.order.*.cancel`)
  async cancelOrder(@Ctx() context: any): Promise<void> {
    try {
        const tokens = context.getSubject().split('.');
        const orderId = tokens[tokens.length - 2];
        await this.inboundPortsAdapter.cancelOrder(orderId);
    } catch (error) {
        throw new RpcException(error.message);
    }
  }


  @EventPattern(`event.warehouse.${process.env.WAREHOUSE_ID}.order.*.complete`)
  async completeOrder(@Ctx() context: any): Promise<void> {
    const tokens = context.getSubject().split('.');
    const orderId = tokens[4];
    await this.inboundPortsAdapter.completeOrder(orderId);
  }

  @MessagePattern(`get.warehouse.${process.env.WAREHOUSE_ID}.order.*.state`)
  async getOrderState(@Ctx() context: any): Promise<OrderStateDTO> {
    const tokens = context.getSubject().split('.');
    const orderId = tokens[tokens.length - 2];
    return await this.inboundPortsAdapter.getOrderState(orderId);
  }

  @MessagePattern(`get.warehouse.${process.env.WAREHOUSE_ID}.order.*`)
  async getOrder(@Ctx() context: any): Promise<string> {
    const orderId = context.getSubject().split('.').pop();
    const order = await this.inboundPortsAdapter.getOrder(orderId);

    let model: any = {
      orderId: order.orderId?.id ?? order.orderId,
      orderState: order.orderState.orderState,
      creationDate: order.creationDate,
      warehouseDeparture: order.warehouseDeparture,
    };

    // InternalOrderDTO specific fields
    if ('warehouseDestination' in order) {
      model.warehouseDestination = order.warehouseDestination;
      model.sellOrderReference = order.sellOrderReference.id ?? "";
    }

    // SellOrderDTO specific fields
    if ('destinationAddress' in order) {
      model.destinationAddress = order.destinationAddress;
    }

    return Promise.resolve(JSON.stringify({ result: { model } }, null, 2));
  }

  @MessagePattern(`get.warehouse.${process.env.WAREHOUSE_ID}.orders`)
  async getOrdersCollection(): Promise<string> {
    const orders = await this.inboundPortsAdapter.getAllOrders();

    const internalOrderRids = orders.internalOrders.map(order => ({
      rid: `warehouse.${process.env.WAREHOUSE_ID}.order.${order.orderId?.id ?? order.orderId}`
    }));

    const sellOrderRids = orders.sellOrders.map(order => ({
      rid: `warehouse.${process.env.WAREHOUSE_ID}.order.${order.orderId?.id ?? order.orderId}`
    }));

    const collection = [...internalOrderRids, ...sellOrderRids];

    return Promise.resolve(JSON.stringify({ result: { collection } }));
  }
}