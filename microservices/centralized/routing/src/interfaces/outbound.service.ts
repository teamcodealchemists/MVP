import { Inject, Injectable } from "@nestjs/common";
import { WarehouseIdDTO } from "./dto/warehouseId.dto";
import { WarehouseAddressDTO } from "./dto/warehouseAddress.dto";
import { WarehouseStateDTO } from "./dto/warehouseState.dto";

import { NatsService } from './../interfaces/nats/nats.service'; 

@Injectable()
export class OutboundService {

  constructor(
    private readonly natsService: NatsService
  ) {}

  async sendAddress(address: WarehouseAddressDTO): Promise<void> {
    // Implementation for sending warehouse address with NATS
    await this.natsService.publish("warehouse.address", address);
  }

  async sendWarehouseDistance(warehouseId: WarehouseIdDTO[]): Promise<void> {
    // Implementation for sending warehouse distance with NATS
    await this.natsService.publish("warehouse.distance", [warehouseId]);
  }

  async sendWarehouseAndState(warehouseState: WarehouseStateDTO): Promise<void> {
    // Implementation for sending warehouse state with NATS
    await this.natsService.publish("warehouse.state", warehouseState);
  }
}