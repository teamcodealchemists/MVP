import { CloudWarehouseStateDTO } from "./dto/cloudWarehouseState.dto";
import { CloudWarehouseIdDTO } from "./dto/cloudWarehouseId.dto";
import { CloudHeartbeatDTO } from "./dto/cloudHeartbeat.dto";

import { CloudWarehouseState } from "../domain/cloudWarehouseState.entity";
import { CloudWarehouseId } from "../domain/cloudWarehouseId.entity";
import { CloudHeartbeat } from "../domain/cloudHeartbeat.entity";


export const DataMapper = {
    cloudWarehouseIdToDomain(cloudWarehouseIdDTO: CloudWarehouseIdDTO): CloudWarehouseId {
        return new CloudWarehouseId(cloudWarehouseIdDTO.warehouseId);
    },

    cloudWarehouseStateToDomain(cloudWarehouseStateDTO: CloudWarehouseStateDTO): CloudWarehouseState {
        return new CloudWarehouseState(
            new CloudWarehouseId(cloudWarehouseStateDTO.warehouseId),
            cloudWarehouseStateDTO.state
        );
    },

    cloudHeartbeatToDomain(cloudHeartbeatDTO: CloudHeartbeatDTO): CloudHeartbeat {
        return new CloudHeartbeat(
            new CloudWarehouseId(cloudHeartbeatDTO.warehouseId),
            cloudHeartbeatDTO.heartbeatmsg,
            cloudHeartbeatDTO.timestamp
        );
    },

    cloudWarehouseIdToDTO(cloudWarehouseId: CloudWarehouseId): CloudWarehouseIdDTO {
        return {
            warehouseId: cloudWarehouseId.getId()
        };
    },

    cloudWarehouseStateToDTO(cloudWarehouseState: CloudWarehouseState): CloudWarehouseStateDTO {
        return {
            warehouseId: cloudWarehouseState.getId().getId(),
            state: cloudWarehouseState.getState()
        };
    },
    cloudHeartbeatToDTO(cloudHeartbeat: CloudHeartbeat): CloudHeartbeatDTO {
        return {
            warehouseId: cloudHeartbeat.getId().getId(),
            heartbeatmsg: cloudHeartbeat.getHeartbeatMsg(),
            timestamp: cloudHeartbeat.getTimestamp()
        };
    }
}