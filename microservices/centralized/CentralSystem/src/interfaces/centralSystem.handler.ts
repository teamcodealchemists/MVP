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
import { parse } from "path";
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
  const result = await firstValueFrom(this.natsClient.send("aggregatedWarehouses.inventory", JSON.stringify({})));
  //console.log("handleCloudInventoryRequest result:", JSON.stringify(result));
  const parsed = typeof result === "string" ? JSON.parse(result) : result;
  return DataMapper.toDomainInventory(parsed);
}

async handleCloudOrdersRequest(): Promise<Orders | null> {
  const result = await firstValueFrom(
    this.natsClient.send("get.aggregate.orders.centralized", JSON.stringify({}))
  );
  //console.log("handleCloudOrdersRequest result:", result);

  const parsed = typeof result === "string" ? JSON.parse(result) : result;

  const ordersCollection = parsed?.result?.collection ?? parsed;

  if (Array.isArray(ordersCollection) && ordersCollection.length === 0) {
    return Promise.resolve(null);
  }
  //console.log("Parsed ordersCollection:", JSON.stringify(ordersCollection, null, 2));
  return Promise.resolve(DataMapper.ordersToDomain(ordersCollection));
}

async handleWarehouseDistance(warehouseId: warehouseIdDto): Promise<WarehouseId[]> {
  console.log("call.routing.warehouse."+warehouseId.warehouseId+".receiveRequest.set");
  const result = await firstValueFrom(this.natsClient.send("call.routing.warehouse."+warehouseId.warehouseId+".receiveRequest.set",
                                             JSON.stringify(warehouseId)));
  //console.log("Warehouse distance result:", JSON.stringify(result));
  const parsed = typeof result === "string" ? JSON.parse(result) : result;
  const warehousesArray = parsed?.result?.warehouses || [];

  return warehousesArray.map((item: any) => {
    const wIdDto = new warehouseIdDto();
    wIdDto.warehouseId = item.id;
    return DataMapper.warehouseIdToDomain(wIdDto); 
  });
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
