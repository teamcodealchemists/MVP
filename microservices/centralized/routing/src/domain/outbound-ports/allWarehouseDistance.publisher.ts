import {WarehouseId} from '../warehouseId.entity';

export interface AllWarehouseDistancePublisher {
    sendWarehouseDistance(warehouseId: WarehouseId[]): void;
}