import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { Inventory } from "../../src/domain/inventory.entity";
import { Orders } from "../../src/domain/orders.entity";
import { WarehouseState } from "../../src/domain/warehouseState.entity";
import { firstValueFrom } from "rxjs";
import { InternalOrderDTO } from "./http/dto/internalOrder.dto";
import { warehouseIdDto } from "./http/dto/warehouseId.dto";
import { OrderId } from "src/domain/orderId.entity";
import { WarehouseId } from "src/domain/warehouseId.entity";
import { ProductId } from "src/domain/productId.entity";
import { DataMapper } from "src/infrastructure/mappers/dataMapper";
@Injectable()
export class centralSystemHandler implements OnModuleInit {
  constructor(
    @Inject("NATS_SERVICE") private readonly natsClient: ClientProxy,
  ) {}

  async onModuleInit() {
    await this.natsClient.connect();
  }

  async handleNotification(message: string): Promise<void> {
    /*
    console.log("----------------------------------------------------------------------------------------------");
    console.log("|Handler announcement|");
    console.log(message);
    console.log("----------------------------------------------------------------------------------------------");
    */
    this.natsClient.emit("notification.send", { message });
    return Promise.resolve();
  }

  async handleOrder(order: InternalOrderDTO): Promise<void> {
    console.log("handler : Magazzino mandato! \n"+ order);
    try {
      this.natsClient.emit("call.warehouse."+order.warehouseDeparture+".order.internal.new", order);
    } catch (error) {
      console.error("Error creating internal order:", error);
      throw error;
    }
  }

  async handleCloudInventoryRequest(): Promise<Inventory> {
    const result = await firstValueFrom(this.natsClient.send("cloud.inventory.request", {}));
    return Promise.resolve(DataMapper.toDomainInventory(result));
  }

  async handleCloudOrdersRequest(): Promise<Orders> {
    return Promise.resolve(await firstValueFrom(
        this.natsClient.send("get.aggregate.orders", {})
    ));
  }

  async handleWarehouseDistance(warehouseId: warehouseIdDto): Promise<WarehouseState[]> {
    return Promise.resolve(await firstValueFrom(
        this.natsClient.send("call.routing.warehouse."+warehouseId.warehouseId+".receiveRequest.set", warehouseId)
    ));
  }

   async handleRequestInvResult(message : string, productId : ProductId, warehouseId : WarehouseId): Promise<void> {
    /*
    console.log("----------------------------------------------------------------------------------------------");
    console.log("|Handler announcement|");
    console.log(message);
    console.log("----------------------------------------------------------------------------------------------");
    */
    this.natsClient.emit("send.InvRequestResult", { message });
    return Promise.resolve();
  }
    async handleRequestOrdResult(message : string, orderId : OrderId, warehouseId : WarehouseId): Promise<void> {
    /*
    console.log("----------------------------------------------------------------------------------------------");
    console.log("|Handler announcement|");
    console.log(message);
    console.log("----------------------------------------------------------------------------------------------");
    */
    this.natsClient.emit("call.warehouse."+warehouseId+".order."+orderId+".cancel", { message });
    return Promise.resolve();
  }
}
