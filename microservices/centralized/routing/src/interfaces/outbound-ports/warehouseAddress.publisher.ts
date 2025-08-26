import {WarehouseAddress} from '../../domain/warehouseAddress.entity';

export interface WarehouseAddressPublisher {
    sendAddress(address: WarehouseAddress): void;
}