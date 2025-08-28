import {WarehouseIdDTO} from 'src/interfaces/dto/warehouseId.dto';

export interface CriticQuantityEvent {
    receiveRequest(warehouseId: WarehouseIdDTO): Promise<void>;
}