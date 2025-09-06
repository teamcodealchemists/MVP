import { Inject, Injectable } from '@nestjs/common';
import { WarehouseId } from '../domain/warehouseId.entity';
import { WarehouseAddress } from '../domain/warehouseAddress.entity';
import { WarehouseState } from '../domain/warehouseState.entity';
import { RoutingRepository } from '../domain/routing.repository';
import { haversine, geocodeAddress} from '../interfaces/geo';

@Injectable()
export class RoutingService {
  constructor(
    @Inject("ROUTINGREPOSITORY")
    private readonly RoutingRepository: RoutingRepository,
  ) {}

  async calculateDistance(sourceWarehouseId: WarehouseId): Promise<WarehouseId[]> {
    // Ottieni l'indirizzo del magazzino sorgente
    const sourceAddressObj = await this.RoutingRepository.getWarehouseAddressById(sourceWarehouseId);
    if (!sourceAddressObj) {
      throw new Error("Magazzino sorgente non trovato");
    }
    console.log('SourceAddressObj:', sourceAddressObj);
    const sourceAddress = sourceAddressObj.getAddress();
    const [sourceLat, sourceLon] = await geocodeAddress(sourceAddress);
    console.log(`SourceAddress: ${sourceAddress}, Lat: ${sourceLat}, Lon: ${sourceLon}`);

    // Ottieni tutti gli indirizzi dei magazzini
    const allAddresses = await this.RoutingRepository.getAllWarehouseAddresses();
    const distances = await Promise.all(
      allAddresses
        .filter(addr => addr.getWarehouseState().getId().getId() !== sourceWarehouseId.getId())
        .map(async (addr) => {
          const [lat, lon] = await geocodeAddress(addr.getAddress());
          return {
            id: addr.getWarehouseState().getId(),
            distance: haversine([sourceLat, sourceLon], [lat, lon]),
          };
        })
    );

    console.log(distances);
    return distances
      .sort((a, b) => a.distance - b.distance)
      .map(d => d.id);
  }

  async updateWarehouseAddress(warehouseId: WarehouseId, address: string): Promise<string | false> {
    if (!address) {
      return false;
    }
    const warehouseState = new WarehouseState(warehouseId, 'default');
    const warehouseAddress = new WarehouseAddress(warehouseState, address);
    await this.RoutingRepository.updateWarehouseAddress(warehouseAddress);
    return JSON.stringify({ result: 'Address updated successfully' });
  }

  async removeWarehouseAddress(warehouseId: WarehouseId): Promise<string> {
    // Implement remove logic here
    await this.RoutingRepository.removeWarehouseAddress(warehouseId);
    return JSON.stringify({ result: 'Address removed successfully' });
  }

  async saveWarehouseAddress(warehouseId: WarehouseId, address: string, state: string): Promise<void> {
    const warehouseState = new WarehouseState(warehouseId, state);
    const warehouseAddress = new WarehouseAddress(warehouseState, address);
    await this.RoutingRepository.saveWarehouseAddress(warehouseAddress);
  }

  async saveWarehouse(state: string, address: string): Promise<string|false> {
      if (!address || !state) {
        return false;
      }
    const nextId = await this.generateNextWarehouseId();
    const warehouseId = new WarehouseId(nextId);
    console.log({
        warehouseId: warehouseId.getId(),
        state: state,
        address: address,
    });
    await this.saveWarehouseAddress(warehouseId, address, state);
    return JSON.stringify({ result: 'Warehouse created successfully' });
  }

  async updateWarehouseState(warehouseId: WarehouseId, state: string): Promise<string|false> {
    if (!state) {
      return false;
    }
    // Implement update logic here
    await this.RoutingRepository.updateWarehouseState(new WarehouseState(warehouseId, state));
    return JSON.stringify({ result: 'Warehouse state updated successfully' });
  }

  async generateNextWarehouseId(): Promise<number> {
    const warehouses = await this.RoutingRepository.getAllWarehouses();
    if (warehouses.length === 0) return 1;
    const maxId = Math.max(...warehouses.map(w => w.getId()));
    return maxId + 1;
  }
}

