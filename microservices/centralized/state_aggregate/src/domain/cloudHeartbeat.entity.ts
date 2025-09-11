import { CloudWarehouseId } from "./cloudWarehouseId.entity";

export class CloudHeartbeat {
    constructor(
        private warehouseId: CloudWarehouseId,
        private heartbeatmsg: string,
        private timestamp: Date,
    ) { 
    }

    getId(): CloudWarehouseId {
        return this.warehouseId;
    }

    getHeartbeatMsg(): string {
        return this.heartbeatmsg;
    }

    getTimestamp(): Date {
        return this.timestamp;
    }
}