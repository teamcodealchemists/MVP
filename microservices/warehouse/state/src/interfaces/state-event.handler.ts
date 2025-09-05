// src/interfaces/event/state-event.handler.ts
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ClientProxy } from '@nestjs/microservices';
import { WarehouseState } from "../domain/warehouse-state.entity";
import { Heartbeat } from "../domain/heartbeat.entity";
import { DataMapper } from "../infrastructure/mappers/datamapper";

@Injectable()
export class StateEventHandler implements OnModuleInit {
  constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) {}

  async onModuleInit() {
    await this.natsClient.connect(); 
  }

async publishHeartbeat(heartbeat: Heartbeat, warehouseId: number): Promise<void> {
    await this.natsClient.emit(`state.heartbeat.${warehouseId}`, {
        warehouseId: warehouseId,
        heartbeatMsg: heartbeat.getHeartbeatMsg(),
        timestamp: heartbeat.getTimestamp()
    });
}
 

  async publishState(state: WarehouseState, warehouseId: number): Promise<void> {
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
