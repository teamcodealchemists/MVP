import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { OrdersService } from 'src/application/orders.service';

import { Orders } from "src/domain/orders.entity";
import { OrderItem } from "src/domain/orderItem.entity";
import { OrderItemDetail } from "src/domain/orderItemDetail.entity";
import { OrderState } from "src/domain/orderState.enum";

import { OrderId } from "src/domain/orderId.entity";
import { InternalOrder } from "src/domain/internalOrder.entity";
import { SellOrder } from "src/domain/sellOrder.entity";


@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern(`api.warehouse.${process.env.WAREHOUSE_ID}.getHello`)
  getHello(): Promise<string> {
    return this.ordersService.getHello();
  }

  stockReserved(orderQuantityDTO: OrderQuantityDTO): void {

  }

  addSellOrder(sellOrderDTO: SellOrderDTO): void  {

  }

  addInternalOrder(internalOrderDTO: InternalOrderDTO): void {

  }

  waitingForStock(orderIdDTO: OrderIdDTO) : void {

  }

  stockShipped(orderIdDTO: OrderIdDTO) : void {

  }

  stockReceived(orderIdDTO: OrderIdDTO): void {

  }

  replenishmentReceived(orderIdDTO: OrderIdDTO): void {

  }

  updateOrderState(orderIdDTO: OrderIdDTO, orderStateDTO: OrderStateDTO): void {

  }

  cancelOrder(orderIdDTO: OrderIdDTO): void {

  }

  completeOrder(orderIdDTO: OrderIdDTO): void {

  }

  getOrderState(orderIdDTO: OrderIdDTO): OrderStateDTO {

  }

  getOrder(orderIdDTO: OrderIdDTO): 	InternalOrderDTO | SellOrderDTO {

  }

  getAllOrders(): OrdersDTO {

  }
}
