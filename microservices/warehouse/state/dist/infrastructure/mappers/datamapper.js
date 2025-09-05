"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataMapper = void 0;
const warehouse_id_entity_1 = require("../../domain/warehouse-id.entity");
const warehouse_state_entity_1 = require("../../domain/warehouse-state.entity");
const heartbeat_entity_1 = require("../../domain/heartbeat.entity");
exports.DataMapper = {
    toDomainWarehouseId(dto) {
        return new warehouse_id_entity_1.WarehouseId(dto.id);
    },
    toDomainWarehouseState(dto) {
        return new warehouse_state_entity_1.WarehouseState(dto.state);
    },
    toDomainHeartbeat(dto) {
        const warehouseId = new warehouse_id_entity_1.WarehouseId(dto.warehouseId);
        return new heartbeat_entity_1.Heartbeat(dto.heartbeatMsg, dto.timestamp, warehouseId);
    },
    toDTOWarehouseId(entity) {
        return { id: entity.getId() };
    },
    toDTOWarehouseState(entity) {
        return { state: entity.getState() };
    },
    toDTOHeartbeat(entity) {
        return {
            heartbeatMsg: entity.getHeartbeatMsg(),
            timestamp: entity.getTimestamp(),
            warehouseId: entity.getId(),
        };
    }
};
