import { Controller, Get } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CloudWarehouseId } from '../domain/cloudWarehouseId.entity';
import { StateAggregateService } from '../application/stateAggregate.service';
import { CloudWarehouseState } from 'src/domain/cloudWarehouseState.entity';
import { GetStateUseCase } from 'src/domain/inbound-ports/getStateUseCase';
import { HeartbeatReceivedEvent } from 'src/domain/inbound-ports/heartbeatReceived.event';
import { UpdateStateUseCase } from 'src/domain/inbound-ports/updateStateUseCase';
import { CloudHeartbeat } from 'src/domain/cloudHeartbeat.entity';
import { CloudHeartbeatDTO } from './dto/cloudHeartbeat.dto';

@Controller()
export class StateAggregateController implements GetStateUseCase, HeartbeatReceivedEvent, UpdateStateUseCase {
  constructor(private readonly stateAggregateService: StateAggregateService) {}

  @MessagePattern(`call.cloudState.warehouse.${process.env.WAREHOUSE_ID}.heartbeat.response`)
  async syncReceivedHeartbeat(@Payload('params') message: CloudHeartbeatDTO): Promise<string> {
    try{
      const warehouseId = new CloudWarehouseId(message.warehouseId);
      const isAlive = message.heartbeatmsg === 'ONLINE';
      // Notifica il service che è arrivata la risposta
      return this.stateAggregateService.handleHeartbeatResponse(warehouseId, isAlive);
    } catch (error) {
      return Promise.resolve(JSON.stringify({ 
        error: {
          code: "system.invalidParams",
          message: error.message
        }
      }));
  }
}

  @MessagePattern(`call.cloudState.warehouse.${process.env.WAREHOUSE_ID}.state.set`)
  async updateState(data: { warehouseId: number, newState: 'ONLINE' | 'OFFLINE' }): Promise<string> {
    try{
      const warehouseId = new CloudWarehouseId(data.warehouseId);
      const newState = data.newState;

      // Recupera lo stato attuale dal db
      const currentState = await this.stateAggregateService['cloudStateRepository'].getState(warehouseId);

      // Se lo stato è cambiato, aggiorna il db
      if (!currentState || currentState.getState() !== newState) {
        await this.stateAggregateService['cloudStateRepository'].updateState(new CloudWarehouseState(warehouseId, newState));
        // Notifica l'evento di stato aggiornato
        this.stateAggregateService['CloudStateEventAdapter'].stateUpdated(new CloudWarehouseState(warehouseId, newState));
      }
      return Promise.resolve("State updated successfully");
    } catch (error) {
      return Promise.resolve(JSON.stringify({ 
        error: {
          code: "system.invalidParams",
          message: error.message
        }
      }));
    }
  }

  @MessagePattern(`call.cloudState.warehouse.${process.env.WAREHOUSE_ID}.state.get`)
  async getState(data: { warehouseId: number }): Promise<CloudWarehouseState | string> {
    try{
      const warehouseId = new CloudWarehouseId(data.warehouseId);
      const currentState = await this.stateAggregateService['cloudStateRepository'].getState(warehouseId);
      if (currentState) {
        // Invia lo stato attuale come risposta
        this.stateAggregateService['CloudStateEventAdapter'].publishState(currentState);
      }
      return currentState ? currentState : "No state found for the given warehouseId";  //DA CONTROLLARE
    } catch (error) {
      return Promise.resolve(JSON.stringify({ 
        error: {
          code: "system.invalidParams",
          message: error.message
        }
      }));
    }
  }

}