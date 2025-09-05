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

  @MessagePattern(`call.aggregate.orders.stock.reserved`)
  async stockReserved(@Payload() orderQuantityDTO: SyncOrderQuantityDTO): Promise<void> {
    await this.inboundPortsAdapter.stockReserved(orderQuantityDTO);
  }

  @MessagePattern(`call.aggregate.order.sell.new`)
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

  @MessagePattern(`call.aggregate.order.internal.new`)
  async syncAddInternalOrder(@Payload() payload: any): Promise<void> {
    const internalOrderDTO = {
      orderId: payload.orderId,
      items: payload.items,
      orderState: payload.orderState,
      creationDate: payload.creationDate,
      warehouseDeparture: payload.warehouseDeparture,
      warehouseDestination: payload.warehouseDestination
    };
    await this.inboundPortsAdapter.syncAddInternalOrder(internalOrderDTO);
  }

  @MessagePattern(`call.aggregate.order.*.state.update.*`)
  async updateOrderState(@Ctx() context: any): Promise<void> {
    const tokens = context.getSubject().split('.');
    const orderId = tokens[3];
    const orderState = tokens[6];
    await this.inboundPortsAdapter.updateOrderState(orderId, orderState);
  }

  @MessagePattern(`call.aggregate.order.*.cancel`)
  async cancelOrder(@Ctx() context: any): Promise<void> {
    const tokens = context.getSubject().split('.');
    const orderId = tokens[tokens.length - 2];
    await this.inboundPortsAdapter.cancelOrder(orderId);
  }

  @MessagePattern(`call.aggregate.order.*.complete`)
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
  async getOrder(@Ctx() context: any): Promise<SyncInternalOrderDTO | SyncSellOrderDTO> {
    const orderId = context.getSubject().split('.').pop();
    return await this.inboundPortsAdapter.getOrder(orderId);
  }

  @MessagePattern(`get.aggregate.orders`)
  async getAllOrders(): Promise<SyncOrdersDTO> {
      this.logger.verbose('[Controller] CIAONES - Richiesta ricevuta');

      try {
          this.logger.verbose('[Controller] Chiamando inboundPortsAdapter...');
          const result = await this.inboundPortsAdapter.getAllOrders();
          this.logger.verbose('[Controller] Richiesta elaborata con successo');
          return result;
      } catch (error) {
          this.logger.error('[Controller] Errore in getAllOrders:', error);
          this.logger.error('[Controller] Stack trace:', error.stack);
          
          // IMPORTANTE: Restituisci sempre un DTO valido, non lanciare eccezioni
          return {
              sellOrders: [],
              internalOrders: []
          };
      }
  }
}