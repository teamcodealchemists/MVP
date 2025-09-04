import { MessagePattern } from '@nestjs/microservices';
import { OutboundService } from 'src/interfaces/outbound.service';

import { DataMapper } from '../../interfaces/data.mapper';
import { domainToUnicode } from 'url';
import { CheckHeartbeatPublisher } from 'src/domain/outbound-ports/checkHeartbeat.publisher';
import { StatePublisher } from 'src/domain/outbound-ports/state.publisher';
import { StateUpdatesPublisher } from 'src/domain/outbound-ports/stateUpdates.publisher';
import { CloudHeartbeat } from 'src/domain/cloudHeartbeat.entity';
import { CloudWarehouseState } from 'src/domain/cloudWarehouseState.entity';
import { CloudHeartbeatDTO } from 'src/interfaces/dto/cloudHeartbeat.dto';
import { CloudWarehouseStateDTO } from 'src/interfaces/dto/cloudWarehouseState.dto';




export class CloudStateEventAdapter implements CheckHeartbeatPublisher, StatePublisher, StateUpdatesPublisher {
    constructor(private readonly outboundService: OutboundService) {}
    
    publishHeartbeat(heartbeat: CloudHeartbeat): void {
        const dto: CloudHeartbeatDTO = DataMapper.cloudHeartbeatToDTO(heartbeat);
        this.outboundService.publishHeartbeat(dto);
    }
    
    publishState(state: CloudWarehouseState): void {
        const dto: CloudWarehouseStateDTO = DataMapper.cloudWarehouseStateToDTO(state);
        this.outboundService.publishState(dto);
    }
    stateUpdated(state: CloudWarehouseState): void {
        const dto: CloudWarehouseStateDTO = DataMapper.cloudWarehouseStateToDTO(state);
        this.outboundService.stateUpdated(dto);
    }

}