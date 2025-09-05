import { Injectable } from "@nestjs/common";
import { StateService } from "../../../application/state.service";
import { DataMapper } from "../../mappers/datamapper";

// Ports Interfaces
import { GetStateEventListener } from "../../../domain/inbound-ports/getState.listener";
import { WarehouseState } from "../../../domain/warehouse-state.entity";
// DTOs
import { WarehouseIdDTO } from "../../../interfaces/dto/warehouse-id.dto";
import { WarehouseStateDTO } from "../../../interfaces/dto/warehouse-state.dto";

import { StateEventHandler } from "../../../interfaces/state-event.handler";
import { Heartbeat } from "../../../domain/heartbeat.entity";


@Injectable()
export class InboundPortsAdapter implements GetStateEventListener {
  constructor(
    private readonly stateService: StateService,
    private readonly stateEvenntHandler: StateEventHandler
  ) {}

  async getSyncedState(warehouseIdDTO: WarehouseIdDTO): Promise<WarehouseStateDTO> {
    const warehouseState = await this.stateService.getState(
    DataMapper.toDomainWarehouseId(warehouseIdDTO)
  );

  if (!warehouseState) {
    
    return { state: 'unknown' }; 
  }

  const warehouseId = DataMapper.toDomainWarehouseId(warehouseIdDTO);
  const heartbeat = new Heartbeat('ALIVE', new Date(), warehouseId);

  await this.stateEvenntHandler.publishHeartbeat(heartbeat);


  return DataMapper.toDTOWarehouseState(warehouseState);
}
  }

