import { Injectable } from "@nestjs/common";
import { StateService } from "../../../application/state.service";
import { DataMapper } from "../../mappers/datamapper";

// Ports Interfaces
import { GetStateEventListener } from "../../../domain/inbound-ports/getState.listener";
import { WarehouseState } from "../../../domain/warehouse-state.entity";
// DTOs
import { WarehouseIdDTO } from "../../../interfaces/dto/warehouse-id.dto";
import { WarehouseStateDTO } from "../../../interfaces/dto/warehouse-state.dto";
@Injectable()
export class InboundPortsAdapter implements GetStateEventListener {
  constructor(private readonly stateService: StateService) {}

  async getSyncedState(warehouseIdDTO: WarehouseIdDTO): Promise<WarehouseStateDTO> {
    const warehouseState = await this.stateService.getState(
    DataMapper.toDomainWarehouseId(warehouseIdDTO)
  );

  if (!warehouseState) {
    
    return { state: 'unknown' }; 
  }

  return DataMapper.toDTOWarehouseState(warehouseState);
}
  }

