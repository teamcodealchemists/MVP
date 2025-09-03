import { Injectable } from "@nestjs/common";
import { InsufficientQuantityEvent } from "src/domain/inbound-ports/insufficientQuantityEvent";
import { CriticalQuantityEvent } from "src/domain/inbound-ports/criticalQuantityEvent";
import { ReceiveWarehouseState } from "src/domain/inbound-ports/receiveWarehouseState";
import { OrderQuantityDTO } from "src/interfaces/http/dto/orderQuantity.dto";
import { productDto } from "src/interfaces/http/dto/product.dto";
import { warehouseIdDto } from "src/interfaces/http/dto/warehouseId.dto";
import { WarehouseStateDTO } from "src/interfaces/http/dto/warehouseState.dto";
import { CentralSystemService } from "src/application/centralsystem.service";
import { DataMapper } from "src/infrastructure/mappers/dataMapper";
import { WarehouseState } from "src/domain/warehouseState.entity";
@Injectable()
export class InboundPortsAdapter
  implements InsufficientQuantityEvent, CriticalQuantityEvent, ReceiveWarehouseState
{   
  constructor(private readonly service : CentralSystemService) {}

  async handleInsufficientQuantity(oQ: OrderQuantityDTO, id : warehouseIdDto): Promise<void> {
    const domainOrderQuantity = await DataMapper.orderQuantityToDomain(oQ);
    const domainWarehouseId = DataMapper.warehouseIdToDomain(id);
    try {
      await this.service.CheckInsufficientQuantity(domainOrderQuantity,domainWarehouseId);
    } catch (error) {
      console.error("Error handling insufficient quantity:", error);
      throw error;
    }
  }

  async handleCriticalQuantityMin(product: productDto): Promise<void> {
    const domainProduct = await DataMapper.toDomainProduct(product);
    await this.service.ManageCriticalMinThres(domainProduct);
  }
async handleCriticalQuantityMax(product: productDto): Promise<void> {
    const domainProduct = await DataMapper.toDomainProduct(product);
    await this.service.ManageOverMaxThres(domainProduct);
  }
  async getWarehouseState(warehouseState: WarehouseStateDTO[]): Promise<void> {
    const domainWarehouseStates: WarehouseState[] = [];
    for (const wsDTO of warehouseState) {
      const wsDomain = DataMapper.warehouseStatetoDomain(wsDTO);
      domainWarehouseStates.push(wsDomain);
    }
    await this.service.CheckWarehouseState(domainWarehouseStates);
  }
}
