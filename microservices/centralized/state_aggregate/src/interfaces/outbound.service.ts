import { Inject, Injectable } from "@nestjs/common";
import { CloudWarehouseIdDTO } from "./dto/cloudWarehouseId.dto";


import { NatsService } from '../interfaces/nats/nats.service'; 
import { CloudHeartbeatDTO } from "./dto/cloudHeartbeat.dto";
import { CloudWarehouseStateDTO } from "./dto/cloudWarehouseState.dto";

@Injectable()
export class OutboundService {

  constructor(
    private readonly natsService: NatsService
  ) {}

  publishHeartbeat(heartbeat: CloudHeartbeatDTO): void {
    this.natsService.publish('call.cloud.checkHeartbeat', heartbeat);
  }

  publishState(state: CloudWarehouseStateDTO): void {
    this.natsService.publish('call.cloud.publishState', state);
  }

  stateUpdated(state: CloudWarehouseStateDTO): void {
    this.natsService.publish('cloud.stateUpdated', state);
  }


}