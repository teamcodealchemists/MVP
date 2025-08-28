import { WarehouseAddress } from "./warehouseAddress.entity";
import { WarehouseId } from "./warehouseId.entity";
import { WarehouseState } from "./warehouseState.entity";


export interface RoutingRepository {
    saveWarehouse(warehouse: WarehouseId): Promise<void>
    getWarehouseById(id: WarehouseId): Promise<WarehouseId | null>
    getAllWarehouses(): Promise<WarehouseId[]>
    saveWarehouseAddress(address: WarehouseAddress): Promise<void>
    removeWarehouseAddress(id: WarehouseId): Promise<void>
    updateWarehouseAddress(address: WarehouseAddress): Promise<void>
    getWarehouseAddressById(id: WarehouseId): Promise<WarehouseAddress | null>
    getAllWarehouseAddresses(): Promise<WarehouseAddress[]>
    saveWarehouseState(state: WarehouseState): Promise<void>
    getWarehouseStateById(id: WarehouseId): Promise<WarehouseState | null>
    getAllWarehouseStates(): Promise<WarehouseState[]>
    updateWarehouseState(state: WarehouseState): Promise<void>
}

export const RoutingRepository = Symbol("ROUTINGREPOSITORY");