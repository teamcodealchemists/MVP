import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ClientProxy } from '@nestjs/microservices';
import { WarehouseState } from "../domain/warehouse-state.entity";
import { Heartbeat } from "../domain/heartbeat.entity";
import { DataMapper } from "../infrastructure/mappers/datamapper";
import { WarehouseId } from "../domain/warehouse-id.entity";
import { HeartbeatDTO } from "./dto/heartbeat.dto";

@Injectable()
export class StateEventHandler implements OnModuleInit {
  constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) {}

  async onModuleInit() {
    await this.natsClient.connect(); 
  }

async publishHeartbeat(heartbeat: HeartbeatDTO): Promise<void> {
  console.log(JSON.stringify(heartbeat));
  await this.natsClient.emit(`state.heartbeat.${heartbeat.warehouseId}`, heartbeat);
}
 
// serve??
  async publishState(warehouseId: WarehouseId , state: WarehouseState): Promise<void> {
    await this.natsClient.emit(`state.get.${warehouseId}`, {
        warehouseId: warehouseId,
        state: state.getState()
    });
} 

async stateUpdated(state: WarehouseState, warehouseId: number): Promise<void> {
    await this.natsClient.emit(`state.updated.${warehouseId}`, {
        warehouseId: warehouseId,
        state: state.getState() 
    });
}
  
  
}
