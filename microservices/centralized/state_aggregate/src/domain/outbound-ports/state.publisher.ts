import {CloudWarehouseState} from '../cloudWarehouseState.entity';

export interface StatePublisher {
    publishState(state: CloudWarehouseState): void;
}