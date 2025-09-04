import { CloudWarehouseId } from './cloudWarehouseId.entity';
import { CloudWarehouseState } from './cloudWarehouseState.entity';

export interface CloudStateRepository {
  getState(cloudWarehouseId: CloudWarehouseId): Promise<CloudWarehouseState | null>;
  updateState(cloudWarehouseState: CloudWarehouseState): Promise<boolean>;
}

export const CloudStateRepository = Symbol('CLOUDSTATEREPOSITORY');