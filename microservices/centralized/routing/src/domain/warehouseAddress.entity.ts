import {WarehouseState} from './warehouseState.entity';
import {WarehouseId} from './warehouseId.entity';

export class WarehouseAddress {
    constructor(
        private warehouseState: WarehouseState,
        private address: string,
    ) { 
    }

    getWarehouseState(): WarehouseState {
        return this.warehouseState;
    }

    getAddress(): string {
        return this.address;
    }

    getId(): WarehouseId {
        return this.warehouseState.getId();
    }

    setState(newState: string): void {
        this.warehouseState.setState(newState);
    }

    setAddress(newAddress: string): void {
        this.address = newAddress;
    }

}