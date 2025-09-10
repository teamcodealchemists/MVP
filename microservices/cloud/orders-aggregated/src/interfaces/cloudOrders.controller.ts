import { Logger, Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload, Ctx } from '@nestjs/microservices';
import { CloudInboundPortsAdapter } from '../infrastructure/adapters/cloudInboundPorts.adapter';

import { SyncOrderQuantityDTO} from "src/interfaces/dto/syncOrderQuantity.dto";
import { SyncSellOrderDTO } from "src/interfaces/dto/syncSellOrder.dto";
import { SyncInternalOrderDTO } from "src/interfaces/dto/syncInternalOrder.dto";
import { SyncOrdersDTO } from "src/interfaces/dto/syncOrders.dto";
import { SyncOrderStateDTO } from "src/interfaces/dto/syncOrderState.dto";

@Controller()
export class CloudOrdersController {
  private readonly logger = new Logger(CloudOrdersController.name);

  constructor(
    private readonly inboundPortsAdapter: CloudInboundPortsAdapter,
  ) {}

  @MessagePattern(`event.aggregate.orders.stock.reserved`)
  async stockReserved(@Payload() orderQuantityDTO: SyncOrderQuantityDTO): Promise<void> {
    await this.inboundPortsAdapter.stockReserved(orderQuantityDTO);
  }

  @MessagePattern(`event.aggregate.order.sell.new`)
  async syncAddSellOrder(@Payload() payload: any): Promise<void> {
    const sellOrderDTO = {
      orderId: payload.orderId,
      items: payload.items,
      orderState: payload.orderState,
      creationDate: payload.creationDate,
      warehouseDeparture: payload.warehouseDeparture,
      destinationAddress: payload.destinationAddress
    };
    await this.inboundPortsAdapter.syncAddSellOrder(sellOrderDTO);
  }

  @MessagePattern(`event.aggregate.order.internal.new`)
  async syncAddInternalOrder(@Payload() payload: any): Promise<void> {
    const internalOrderDTO = {
      orderId: payload.orderId,
      items: payload.items,
      orderState: payload.orderState,
      creationDate: payload.creationDate,
      warehouseDeparture: payload.warehouseDeparture,
      warehouseDestination: payload.warehouseDestination,
      sellOrderReference: payload.sellOrderReference
    };
    await this.inboundPortsAdapter.syncAddInternalOrder(internalOrderDTO);
  }

  @MessagePattern(`event.aggregate.order.*.state.update.*`)
  async updateOrderState(@Ctx() context: any): Promise<void> {
    const tokens = context.getSubject().split('.');
    const orderId = tokens[3];
    const orderState = tokens[6];
    await this.inboundPortsAdapter.updateOrderState(orderId, orderState);
  }

  @MessagePattern(`event.aggregate.order.*.cancel`)
  async cancelOrder(@Ctx() context: any): Promise<void> {
    const tokens = context.getSubject().split('.');
    const orderId = tokens[tokens.length - 2];
    await this.inboundPortsAdapter.cancelOrder(orderId);
  }

  @MessagePattern(`event.aggregate.order.*.complete`)
  async completeOrder(@Ctx() context: any): Promise<void> {
    const tokens = context.getSubject().split('.');
    const orderId = tokens[tokens.length - 2];
    await this.inboundPortsAdapter.completeOrder(orderId);
  }

  @MessagePattern(`get.aggregate.order.*.state`)
  async getOrderState(@Ctx() context: any): Promise<SyncOrderStateDTO> {
    const tokens = context.getSubject().split('.');
    const orderId = tokens[tokens.length - 2];
    return await this.inboundPortsAdapter.getOrderState(orderId);
  }

@MessagePattern(`get.aggregate.order.*`)
  async getOrder(@Ctx() context: any): Promise<string> {
    const orderId = context.getSubject().split('.').pop();
    let order = await this.inboundPortsAdapter.getOrder(orderId);
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
    return Promise.resolve(JSON.stringify( {result : { model }}));
  }

@MessagePattern(`get.aggregate.filtered.orders`)
async getAllFilteredOrders(): Promise<string> {
  this.logger.verbose('[Controller] Richiesta ordini filtrati ricevuta');
  try {
    this.logger.verbose('[Controller] Chiamando inboundPortsAdapter...');
    const orders = await this.inboundPortsAdapter.getAllFilteredOrders();
    this.logger.verbose('[Controller] Richiesta elaborata con successo');

    const internalOrderRids = orders.internalOrders.map(order => ({
      rid: `aggregate.order.${order.orderId?.id ?? order.orderId}`
    }));

    const sellOrderRids = orders.sellOrders.map(order => ({
      rid: `aggregate.order.${order.orderId?.id ?? order.orderId}`
    }));

    const collection = [...internalOrderRids, ...sellOrderRids];

    return Promise.resolve(JSON.stringify({ result: { collection } }));
  } catch (error) {
    this.logger.error('[Controller] Errore in getAllFilteredOrders:', error);
    this.logger.error('[Controller] Stack trace:', error.stack);

    return Promise.resolve(JSON.stringify( {error: { code: 'system.internalError', message: 'Internal server error' } }));
  }
}

@MessagePattern(`get.aggregate.orders`)
async getAllOrders(): Promise<string> {
  this.logger.verbose('[Controller] Richiesta ricevuta');
  try {
    this.logger.verbose('[Controller] Chiamando inboundPortsAdapter...');
    const orders = await this.inboundPortsAdapter.getAllOrders();
    this.logger.verbose('[Controller] Richiesta elaborata con successo');

    const internalOrderRids = orders.internalOrders.map(order => ({
      rid: `aggregate.order.${order.orderId?.id ?? order.orderId}`
    }));

    const sellOrderRids = orders.sellOrders.map(order => ({
      rid: `aggregate.order.${order.orderId?.id ?? order.orderId}`
    }));

    const collection = [...internalOrderRids, ...sellOrderRids];

    return Promise.resolve(JSON.stringify({ result: { collection } }));
  } catch (error) {
    this.logger.error('[Controller] Errore in getAllOrders:', error);
    this.logger.error('[Controller] Stack trace:', error.stack);

    return Promise.resolve(JSON.stringify( {error: { code: 'system.internalError', message: 'Internal server error' } }));
  }
}

}