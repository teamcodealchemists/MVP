import { WarehouseId } from "./warehouse-id.entity";

export class Heartbeat {
  private heartbeatMsg: string;
  private timestamp: Date;
  private warehouseId: WarehouseId;

  constructor(heartbeatMsg: string, timestamp: Date, warehouseId: WarehouseId) {
    this.heartbeatMsg = heartbeatMsg;
    this.timestamp = timestamp;
    this.warehouseId = warehouseId;
  }

  public getHeartbeatMsg(): string {
    return this.heartbeatMsg;
  }

  public getTimestamp(): Date {
    return this.timestamp;
  }

  public getId(): number {
    return this.warehouseId.getId();
  }
}
