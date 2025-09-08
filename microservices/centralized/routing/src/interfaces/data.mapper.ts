import { WarehouseStateDTO } from "./dto/warehouseState.dto";
import { WarehouseIdDTO } from "./dto/warehouseId.dto";
import { WarehouseAddressDTO } from "./dto/warehouseAddress.dto";

import { WarehouseState } from "src/domain/warehouseState.entity";
import { WarehouseId } from "src/domain/warehouseId.entity";
import { WarehouseAddress } from "src/domain/warehouseAddress.entity";


export const DataMapper = {
    warehouseIdToDomain(warehouseIdDTO: WarehouseIdDTO): WarehouseId {
        return new WarehouseId(warehouseIdDTO.warehouseId);
    },
    
    warehouseStateToDomain(warehouseStateDTO: WarehouseStateDTO): WarehouseState {
        return new WarehouseState(
            new WarehouseId(warehouseStateDTO.warehouseId.warehouseId),
            warehouseStateDTO.state
        );
    },

    warehouseAddressToDomain(warehouseAddressDTO: WarehouseAddressDTO): WarehouseAddress {
        return new WarehouseAddress(
            new WarehouseState(
                new WarehouseId(warehouseAddressDTO.warehouseState.warehouseId.warehouseId), // crea l’oggetto WarehouseId
                warehouseAddressDTO.warehouseState.state
            ),
            warehouseAddressDTO.address
        );
    },

    warehouseAddressToDTO(warehouseAddress: WarehouseAddress): WarehouseAddressDTO {
        return {
            warehouseState: DataMapper.warehouseStateToDTO(warehouseAddress.getWarehouseState()),
            address: warehouseAddress.getAddress()
        };
    },

    warehouseIdToDTO(warehouseId: WarehouseId): WarehouseIdDTO {
        return {
            warehouseId: warehouseId.getId()
        };
    },

    warehouseStateToDTO(warehouseState: WarehouseState): WarehouseStateDTO {
        return {
            warehouseId: { warehouseId: warehouseState.getId().getId() },
            state: warehouseState.getState()
        };
    },
}