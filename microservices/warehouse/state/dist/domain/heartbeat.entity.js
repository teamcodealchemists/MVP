"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Heartbeat = void 0;
class Heartbeat {
    constructor(heartbeatMsg, timestamp, warehouseId) {
        this.heartbeatMsg = heartbeatMsg;
        this.timestamp = timestamp;
        this.warehouseId = warehouseId;
    }
    getHeartbeatMsg() {
        return this.heartbeatMsg;
    }
    getTimestamp() {
        return this.timestamp;
    }
    getId() {
        return this.warehouseId.getId();
    }
}
exports.Heartbeat = Heartbeat;
