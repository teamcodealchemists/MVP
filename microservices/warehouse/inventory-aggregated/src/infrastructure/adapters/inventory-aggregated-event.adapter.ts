import { Injectable } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { SyncProductDTO } from '../../interfaces/dto/syncProduct.dto';
import { SyncProductIdDTO } from '../../interfaces/dto/syncProductId.dto';
import { SyncWarehouseIdDTO } from '../../interfaces/dto/syncWarehouseId.dto';
import { SyncInventoryDTO } from '../../interfaces/dto/syncInventory.dto';

@Injectable()
export class CloudInventoryEventAdapter {
  private client: ClientProxy;

  constructor() {
    this.client = ClientProxyFactory.create({
      transport: Transport.NATS,
      options: {
        url: 'nats://localhost:4222', 
      },
    });
  }

  // Stock Added Port
  stockAdded(dto: SyncProductDTO) {
    this.client.emit('stock.added', dto);
  }

  // Stock Removed Port
  stockRemoved(productId: SyncProductIdDTO, warehouseId: SyncWarehouseIdDTO) {
    this.client.emit('stock.removed', { productId, warehouseId });
  }

  // Stock Updated Port
  stockUpdated(dto: SyncProductDTO) {
    this.client.emit('stock.updated', dto);
  }

 
  publishAll(inventory: SyncInventoryDTO) {
    this.client.emit('inventory.all', inventory);
  }

  publishAllProducts(inventory: SyncInventoryDTO) {
    this.client.emit('inventory.allProducts', inventory);
  }
}