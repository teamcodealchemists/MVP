import {WarehouseAddress} from '../warehouseAddress.entity';

export interface WarehouseAddressPublisher {
    sendAddress(address: WarehouseAddress): void;
}