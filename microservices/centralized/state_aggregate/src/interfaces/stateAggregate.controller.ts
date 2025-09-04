import { Controller, Get } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { CloudWarehouseId } from '../domain/cloudWarehouseId.entity';
import { StateAggregateService } from '../application/stateAggregate.service';

@Controller()
export class StateAggregateController {
  constructor(private readonly stateAggregateService: StateAggregateService) {}

  @EventPattern('heartbeat.response')
  async syncReceivedHeartbeat(data: { warehouseId: number, isAlive: boolean }) {
    const warehouseId = new CloudWarehouseId(data.warehouseId);
    const isAlive = data.isAlive;
    // Notifica il service che è arrivata la risposta
    this.stateAggregateService.handleHeartbeatResponse(warehouseId, isAlive);
  }

}
