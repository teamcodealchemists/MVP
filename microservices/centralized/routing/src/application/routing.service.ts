import { Inject, Injectable } from '@nestjs/common';
import { WarehouseId } from 'src/domain/warehouseId.entity';
import { WarehouseAddress } from 'src/domain/warehouseAddress.entity';
import { WarehouseState } from 'src/domain/warehouseState.entity';
import { RoutingRepository } from 'src/domain/routing.repository';
import { haversine, geocodeAddress} from 'src/interfaces/geo';

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
    const sourceAddress = sourceAddressObj.getAddress();
    const [sourceLat, sourceLon] = await geocodeAddress(sourceAddress);

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

    return distances
      .sort((a, b) => a.distance - b.distance)
      .map(d => d.id);
  }

  async updateWarehouseAddress(warehouseId: WarehouseId, address: string): Promise<void> {
    const warehouseState = new WarehouseState(warehouseId, 'default');
    const warehouseAddress = new WarehouseAddress(warehouseState, address);
    await this.RoutingRepository.updateWarehouseAddress(warehouseAddress);
  }

  async removeWarehouseAddress(warehouseId: WarehouseId): Promise<void> {
    // Implement remove logic here
    await this.RoutingRepository.removeWarehouseAddress(warehouseId);
  }

  async saveWarehouseAddress(warehouseId: WarehouseId, address: string): Promise<void> {
    const warehouseState = new WarehouseState(warehouseId, 'default');
    const warehouseAddress = new WarehouseAddress(warehouseState, address);
    await this.RoutingRepository.saveWarehouseAddress(warehouseAddress);
  }

  async updateWarehouseState(warehouseId: WarehouseId, state: string): Promise<void> {
    // Implement update logic here
    await this.RoutingRepository.updateWarehouseState(new WarehouseState(warehouseId, state));
  }
}

