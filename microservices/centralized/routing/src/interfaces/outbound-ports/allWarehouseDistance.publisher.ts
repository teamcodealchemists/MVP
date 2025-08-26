import {WarehouseId} from '../../domain/warehouseId.entity';

export interface AllWarehouseDistancePublisher {
    sendWarehouseDistance(warehouseId: WarehouseId): void;
}