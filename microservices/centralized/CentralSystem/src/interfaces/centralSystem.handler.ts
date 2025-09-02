import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { Inventory } from "src/domain/inventory.entity";
import { Orders } from "src/domain/orders.entity";
import { WarehouseState } from "src/domain/warehouseState.entity";
import { firstValueFrom } from "rxjs";
import { InternalOrderDTO } from "./http/dto/internalOrder.dto";
import { warehouseIdDto } from "./http/dto/warehouseId.dto";
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
  }

  async handleOrder(order: InternalOrderDTO): Promise<void> {
    console.log("handler : Magazzino mandato! \n"+ order);
    this.natsClient.emit("order.internal.create", order);
  }

  async handleCloudInventoryRequest(): Promise<Inventory> {
    return await firstValueFrom(
        this.natsClient.send("cloud.inventory.request", {})
    );
  }

  async handleCloudOrdersRequest(): Promise<Orders> {
    return await firstValueFrom(
        this.natsClient.send("cloud.orders.request", {})
    );
  }

  async handleWarehouseDistance(warehouseId: warehouseIdDto): Promise<WarehouseState[]> {
    return await firstValueFrom(
        this.natsClient.send("warehouse.distance.request", warehouseId)
    );
  }

  async handleWarehouseState(warehouseId: warehouseIdDto): Promise<void> {
    this.natsClient.emit("warehouse.state.request", warehouseId);
  }
}
