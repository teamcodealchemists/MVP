import { Injectable } from '@nestjs/common';
import { WarehouseId } from 'src/domain/warehouseId.entity';
import { WarehouseAddress } from 'src/domain/warehouseAddress.entity';

@Injectable()
export class RoutingService {
  constructor(
    private readonly warehouseId: WarehouseId,
    private readonly warehouseAddress: WarehouseAddress
  ) {}

  calculateDistance(): WarehouseId[] {
    // Implement distance calculation logic here
    return [this.warehouseId];
  }
}

