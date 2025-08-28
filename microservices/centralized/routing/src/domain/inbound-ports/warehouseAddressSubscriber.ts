import {WarehouseAddressDTO} from 'src/interfaces/dto/warehouseAddress.dto';

export interface WarehouseAddressSubscriber {
  updateAddress(address: WarehouseAddressDTO): Promise<void>;
  removeAddress(address: WarehouseAddressDTO): Promise<void>;
  addAddress(address: WarehouseAddressDTO): Promise<void>;
}