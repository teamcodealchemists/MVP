import {WarehouseAddressDTO} from '../dto/warehouseAddress.dto';

export interface WarehouseAddressSubscriber {
  updateAddress(address: WarehouseAddressDTO): void;
  removeAddress(address: WarehouseAddressDTO): void;
  addAddress(address: WarehouseAddressDTO): void;
}