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
      this.natsClient.emit("call.warehouse."+order.warehouseDeparture+".order.internal.new", JSON.stringify(order));
    } catch (error) {
      console.error("Error creating internal order:", error);
      throw error;
    }
    return Promise.resolve();
  }

async handleCloudInventoryRequest(): Promise<Inventory> {
  const result = await firstValueFrom(this.natsClient.send("cloud.inventory.request", {}));
  const parsed = typeof result === "string" ? JSON.parse(result) : result;
  return DataMapper.toDomainInventory(parsed);
}

async handleCloudOrdersRequest(): Promise<Orders> {
  const result = await firstValueFrom(this.natsClient.send("get.aggregate.orders", {}));
  const parsed = typeof result === "string" ? JSON.parse(result) : result;
  return DataMapper.ordersToDomain(parsed);
}

async handleWarehouseDistance(warehouseId: warehouseIdDto): Promise<WarehouseState[]> {
  const result = await firstValueFrom(this.natsClient.send("get.routing.warehouse.distance", warehouseId));
  const parsed = typeof result === "string" ? JSON.parse(result) : result;
  return parsed.map((item: any) => DataMapper.warehouseStatetoDomain(item));
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
