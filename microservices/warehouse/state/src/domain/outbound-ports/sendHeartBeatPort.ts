import { Heartbeat } from "../heartbeat.entity";
import { WarehouseId } from "../warehouse-id.entity";
import { WarehouseState } from "../warehouse-state.entity";

export interface StatePortPublisher {
  publishHeartbeat(heartbeat : Heartbeat): Promise<void>;
}