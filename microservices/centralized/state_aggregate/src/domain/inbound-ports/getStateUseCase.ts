import { CloudWarehouseIdDTO } from './../../../src/interfaces/dto/cloudWarehouseId.dto';
import { CloudWarehouseState } from '../cloudWarehouseState.entity';

export interface GetStateUseCase {
    getState(id: CloudWarehouseIdDTO): Promise<CloudWarehouseState | string>;
}