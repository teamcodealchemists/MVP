import { Controller, Logger  } from '@nestjs/common';
import { MessagePattern, Payload, Ctx } from '@nestjs/microservices';
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
      await this.inboundPortsAdapter.addSellOrder(sellOrderDTO);
      return Promise.resolve(JSON.stringify({ result: `Sell order with ID ${sellOrderDTO.orderId.id} created` }));
    } catch (error) {
        return Promise.resolve(JSON.stringify({ error: { code: 'system.internalError', message: error?.message || 'Unknown error' } }));
    }
  }

  @MessagePattern(`call.warehouse.${process.env.WAREHOUSE_ID}.order.internal.new`)
  async addInternalOrder(@Payload() payload: any): Promise<string> {
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
  }

  // NUOVA PORTA (Stefano)
  // Riceve il messaggio dall'Inventario del magazzino di partenza dove dice che ha tutta la merce
  @MessagePattern(`call.warehouse.${process.env.WAREHOUSE_ID}.order.sufficient.availability`)
  async sufficientProductAvailability(@Payload() orderIdDTO: OrderIdDTO): Promise<void> {
      await this.inboundPortsAdapter.sufficientProductAvailability(orderIdDTO);
  }

  @MessagePattern(`call.warehouse.${process.env.WAREHOUSE_ID}.order.*.waiting.stock`)
  async waitingForStock(@Ctx() context: any): Promise<void> {
    const tokens = context.getSubject().split('.');
    const orderId = tokens[tokens.length - 3];
    await this.inboundPortsAdapter.waitingForStock(orderId);
  }

  @MessagePattern(`call.warehouse.${process.env.WAREHOUSE_ID}.order.*.stock.shipped`)
  async stockShipped(@Ctx() context: any): Promise<void> {
    const tokens = context.getSubject().split('.');
    const orderId = tokens[tokens.length - 3];
    await this.inboundPortsAdapter.stockShipped(orderId);
  }

  @MessagePattern(`call.warehouse.${process.env.WAREHOUSE_ID}.order.*.stock.received`)
  async stockReceived(@Ctx() context: any): Promise<void> {
    const tokens = context.getSubject().split('.');
    const orderId = tokens[tokens.length - 3];
    await this.inboundPortsAdapter.stockReceived(orderId);
  }

  // Messaggio ricevuto dal servizio di riassortimento
  @MessagePattern(`call.warehouse.${process.env.WAREHOUSE_ID}.order.*.replenishment.received`)
  async replenishmentReceived(@Ctx() context: any): Promise<void> {
    const tokens = context.getSubject().split('.');
    const orderId = tokens[tokens.length - 3];
    await this.inboundPortsAdapter.replenishmentReceived(orderId);
  }

  @MessagePattern(`call.warehouse.${process.env.WAREHOUSE_ID}.order.*.state.update.*`)
  async updateOrderState(@Ctx() context: any): Promise<void> {
    try {
      const tokens = context.getSubject().split('.');
      const orderId = tokens[4];
      const orderState = tokens[7];
      await this.inboundPortsAdapter.updateOrderState(orderId, orderState);
    } catch (error) {
        throw new RpcException(error.message);
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

  @MessagePattern(`call.warehouse.${process.env.WAREHOUSE_ID}.order.*.complete`)
  async completeOrder(@Ctx() context: any): Promise<void> {
    const tokens = context.getSubject().split('.');
    const orderId = tokens[tokens.length - 2];
    await this.inboundPortsAdapter.completeOrder(orderId);
  }

  @MessagePattern(`get.warehouse.${process.env.WAREHOUSE_ID}.order.*.state`)
  async getOrderState(@Ctx() context: any): Promise<OrderStateDTO> {
    const tokens = context.getSubject().split('.');
    const orderId = tokens[tokens.length - 2];
    return await this.inboundPortsAdapter.getOrderState(orderId);
  }

  @MessagePattern(`get.warehouse.${process.env.WAREHOUSE_ID}.order.*`)
  async getOrder(@Ctx() context: any): Promise<InternalOrderDTO | SellOrderDTO> {
    const orderId = context.getSubject().split('.').pop();
    return await this.inboundPortsAdapter.getOrder(orderId);
  }

  @MessagePattern(`get.warehouse.${process.env.WAREHOUSE_ID}.orders`)
  async getAllOrders(): Promise<string> {
    const result =  await this.inboundPortsAdapter.getAllOrders();
    return Promise.resolve(JSON.stringify({ result: { model: result } }));
  }
} 