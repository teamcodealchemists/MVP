import {WarehouseIdDTO} from '../dto/warehouseId.dto';

export interface CriticQuantityEvent {
    receiveRequest(warehouseId: WarehouseIdDTO): void;
}