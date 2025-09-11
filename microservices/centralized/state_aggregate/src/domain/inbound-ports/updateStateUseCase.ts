import { CloudWarehouseStateDTO } from './../../../src/interfaces/dto/cloudWarehouseState.dto';

export interface UpdateStateUseCase {
    updateState(CloudWarehouseStateDTO): Promise<string>;
}