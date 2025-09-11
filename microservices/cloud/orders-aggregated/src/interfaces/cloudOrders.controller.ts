import { Logger, Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload, Ctx } from '@nestjs/microservices';
import { CloudInboundPortsAdapter } from '../infrastructure/adapters/cloudInboundPorts.adapter';

import { SyncOrderQuantityDTO} from "src/interfaces/dto/syncOrderQuantity.dto";
import { SyncOrderIdDTO } from "src/interfaces/dto/syncOrderId.dto";
import { SyncOrderStateDTO } from "src/interfaces/dto/syncOrderState.dto";
import { SyncItemIdDTO } from './dto/syncItemId.dto';

@Controller()
export class CloudOrdersController {
  private readonly logger = new Logger(CloudOrdersController.name);

  constructor(
    private readonly inboundPortsAdapter: CloudInboundPortsAdapter,
  ) {}

  @MessagePattern(`event.aggregate.orders.stock.reserved`)
  async stockReserved(@Payload() payload: any): Promise<void> {
    this.logger.log("Ricevuta chiamata di update qtyReserved!");

    let orderQuantityDTO = new SyncOrderQuantityDTO();
    let orderIdDto = new SyncOrderIdDTO();
    orderIdDto.id = payload.orderIdDTO.id;
    orderQuantityDTO.id = orderIdDto;
    orderQuantityDTO.items = payload.itemsDTO.map((item: any) => {
      const itemIdDto = new SyncItemIdDTO();
      itemIdDto.id = item.itemId.id;
      return {
        itemId: itemIdDto,
        quantity: item.quantity,
      };
    });

    try {
      await this.inboundPortsAdapter.stockReserved(orderQuantityDTO);
    } catch (err) {
      this.logger.error('Error while parsing stockReserved payload', err);
    }
  }

 @MessagePattern(`event.aggregate.orders.stock.unreserve`)
  async unreserveStock(@Payload() payload: any): Promise<void> {
    let orderIdDto = new SyncOrderIdDTO();
    orderIdDto.id = payload.orderIdDTO.id;
    
    this.logger.log(`Ricevuta chiamata di sync unreserveStock per l'ordine ${orderIdDto.id}!`);
    try {
      await this.inboundPortsAdapter.unreserveStock(orderIdDto);
    } catch (err) {
      this.logger.error('Error while parsing stockReserved payload', err);
    }
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

@MessagePattern(`get.aggregate.orders.centralized`)
async getAllOrdersForCentralized(): Promise<string|null> {
  this.logger.verbose('[Controller] Richiesta ricevuta');
  try {
    this.logger.verbose('[Controller] Chiamando inboundPortsAdapter...');
    const orders = await this.inboundPortsAdapter.getAllOrders();
    this.logger.verbose('[Controller] Richiesta elaborata con successo');

    const collection = [...(orders.internalOrders ?? []),...(orders.sellOrders ?? [])];
    if(collection.length === 0){
      return Promise.resolve(null);
    }else{
      return Promise.resolve(JSON.stringify({ result: { collection } }));
    }
  } catch (error) {
    this.logger.error('[Controller] Errore in getAllOrders:', error);
    this.logger.error('[Controller] Stack trace:', error.stack);

    return Promise.resolve(JSON.stringify( {error: { code: 'system.internalError', message: 'Internal server error' } }));
  }
}

}