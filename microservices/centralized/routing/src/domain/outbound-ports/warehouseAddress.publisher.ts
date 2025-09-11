import {WarehouseAddress} from '../warehouseAddress.entity';
import { WarehouseIdDTO } from 'src/interfaces/dto/warehouseId.dto';

export interface WarehouseAddressPublisher {
    sendAddress(address: WarehouseAddress): void;
    sendWarehouseAndState(warehouseId: WarehouseIdDTO, state: 'ONLINE' | 'OFFLINE'): void;
}