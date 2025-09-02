import {WarehouseAddressDTO} from 'src/interfaces/dto/warehouseAddress.dto';

export interface WarehouseAddressSubscriber {
  updateAddress(address: WarehouseAddressDTO): Promise<string|false>;
  removeAddress(address: WarehouseAddressDTO): Promise<string>;
}