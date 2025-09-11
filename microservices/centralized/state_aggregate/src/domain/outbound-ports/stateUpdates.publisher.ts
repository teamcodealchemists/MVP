import {CloudWarehouseState} from '../cloudWarehouseState.entity';

export interface StateUpdatesPublisher {
    stateUpdated(state: CloudWarehouseState): void;
}