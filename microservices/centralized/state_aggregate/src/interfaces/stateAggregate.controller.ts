import { Controller, Get, Res } from '@nestjs/common';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';
import { CloudWarehouseId } from '../domain/cloudWarehouseId.entity';
import { StateAggregateService } from '../application/stateAggregate.service';
import { CloudWarehouseState } from '../domain/cloudWarehouseState.entity';
import { GetStateUseCase } from '../domain/inbound-ports/getStateUseCase';
import { HeartbeatReceivedEvent } from '../domain/inbound-ports/heartbeatReceived.event';
import { UpdateStateUseCase } from '../domain/inbound-ports/updateStateUseCase';
import { CloudHeartbeat } from '../domain/cloudHeartbeat.entity';
import { CloudHeartbeatDTO } from './dto/cloudHeartbeat.dto';
import { DataMapper } from './data.mapper';
import { CloudWarehouseIdDTO } from './dto/cloudWarehouseId.dto';


@Controller()
export class StateAggregateController implements GetStateUseCase, HeartbeatReceivedEvent, UpdateStateUseCase {
  constructor(private readonly stateAggregateService: StateAggregateService) {}

  @MessagePattern(`call.cloudState.warehouse.*.heartbeat.response`)
  async syncReceivedHeartbeat(@Payload() payload: any) : Promise<string> {
    try{
      const domainHeartbeat = DataMapper.cloudHeartbeatToDomain(payload.data);
      const warehouseId = new CloudWarehouseId(domainHeartbeat.getId().getId());
      const isAlive = domainHeartbeat.getHeartbeatMsg() === 'ONLINE';
      console.log(`isAlive: ${isAlive}`);
      // Notifica il service che è arrivata la risposta
      return await this.stateAggregateService.handleHeartbeatResponse(warehouseId, isAlive);
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
  async updateState(@Payload('params')data: { warehouseId: number, newState: 'ONLINE' | 'OFFLINE' }): Promise<string> {
    try{
      const warehouseId = new CloudWarehouseId(data.warehouseId);
      const newState = data.newState;

      // Recupera lo stato attuale dal db
      const currentState = await this.stateAggregateService.getState(warehouseId);
      console.log(`Current state: ${currentState ? currentState.getState() : 'none'}, New state: ${newState}`);

      // Se lo stato è cambiato, aggiorna il db
      if (!currentState || currentState.getState() !== newState) {
        await this.stateAggregateService.updateState(new CloudWarehouseState(warehouseId, newState));
        // Notifica l'evento di stato aggiornato
        this.stateAggregateService.notifyStateUpdated(new CloudWarehouseState(warehouseId, newState));
      }
      return Promise.resolve(JSON.stringify({ result: 'Address updated successfully' }));
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
  async getState(@Payload('params') warehouseId: CloudWarehouseIdDTO): Promise<string> {
    try{
      const domainId = DataMapper.cloudWarehouseIdToDomain(warehouseId);
      const cloudWarehouseId = new CloudWarehouseId(domainId.getId());
      const currentState = await this.stateAggregateService.getState(cloudWarehouseId);
      if (currentState) {
        // Invia lo stato attuale come risposta
        this.stateAggregateService.publishState(currentState);
        return Promise.resolve(JSON.stringify({
          result: {
            warehouseId: currentState.getId().getId(),
            state: currentState.getState()
          }
        }));
      }
      return Promise.resolve(JSON.stringify({result: "No state found for the given warehouseId"}));
    } catch (error) {
        return Promise.resolve(JSON.stringify({
          error: {
            code: "system.invalidParams",
            message: error.message
          }
        }));
    }
  }

  @EventPattern('warehouse.state')
  async handleWarehouseStateEvent(@Payload() payload: { warehouseId: CloudWarehouseIdDTO, warehouseState: 'ONLINE' | 'OFFLINE' }) {
    try {
      const warehouseIdNum = payload.warehouseId.warehouseId;
      const warehouseId = new CloudWarehouseId(warehouseIdNum);
      const state = payload.warehouseState;
      await this.stateAggregateService.updateState(new CloudWarehouseState(warehouseId, state));
      // Puoi anche notificare l'evento di stato aggiornato se serve
      this.stateAggregateService.notifyStateUpdated(new CloudWarehouseState(warehouseId, state));
    } catch (error) {
      // Logga l'errore se vuoi
      console.error('Errore durante la ricezione evento warehouse.state:', error);
    }
  }
}