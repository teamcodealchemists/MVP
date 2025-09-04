import { Injectable, Logger } from '@nestjs/common';
import { StatePortPublisher } from '../../../domain/outbound-ports/statePort.publisher';
import { WarehouseState } from '../../../domain/warehouse-state.entity';

@Injectable()
export class OutboundPortsAdapter implements StatePortPublisher {
  private readonly logger = new Logger(OutboundPortsAdapter.name);

  constructor(
    private readonly statePublisher: StatePortPublisher, 
  ) {}

  async publishState(state: WarehouseState): Promise<void> {
    try {
      this.logger.log(`Publishing state for warehouse: ${state.getState()}`);
      await this.statePublisher.publishState(state); 
    } catch (error) {
  const e = error as Error;
  this.logger.error(`Failed to publish warehouse state: ${e.message}`);
}
  }
}