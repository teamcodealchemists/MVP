import { WarehouseAddress } from "./warehouseAddress.entity";
import { WarehouseId } from "./warehouseId.entity";
import { WarehouseState } from "./warehouseState.entity";


export interface RoutingRepository {
    saveWarehouse(warehouse: WarehouseId): Promise<void>
    getWarehouseById(id: WarehouseId): Promise<WarehouseId>
    getAllWarehouses(): Promise<WarehouseId[]>
    saveWarehouseAddress(address: WarehouseAddress): Promise<void>
    removeWarehouseAddress(id: WarehouseId): Promise<void>
    updateWarehouseAddress(address: WarehouseAddress): Promise<void>
    getWarehouseAddressById(id: WarehouseId): Promise<WarehouseAddress>
    getAllWarehouseAddresses(): Promise<WarehouseAddress[]>
    saveWarehouseState(state: WarehouseState): Promise<void>
    getWarehouseStateById(id: WarehouseId): Promise<WarehouseState>
    getAllWarehouseStates(): Promise<WarehouseState[]>
}

export const RoutingRepository = Symbol("ROUTINGREPOSITORY");