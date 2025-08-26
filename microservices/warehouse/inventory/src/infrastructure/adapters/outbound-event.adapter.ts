
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { connect, NatsConnection, StringCodec } from 'nats';
import { Product } from 'src/domain/product.entity';
import { CriticalThresEventPort } from '../../domain/ports/critical-thres-event.port';
import { StockAddedPort } from 'src/domain/ports/stock-added.port';
import { StockRemovedPort } from 'src/domain/ports/stock-removed.port';
import { StockUpdatedPort } from 'src/domain/ports/stock-updated.port';
import { ResultProductAvailabilityPublisher } from 'src/domain/ports/result-product-availability.publisher';
import { RestockingRequestPort } from 'src/domain/ports/restocking-request.port';

@Injectable()
export class OutboundEventAdapter
  implements
    OnModuleInit,
    OnModuleDestroy,
    CriticalThresEventPort,
    StockAddedPort,
    StockRemovedPort,
    StockUpdatedPort,
    ResultProductAvailabilityPublisher,
    RestockingRequestPort
{
  private nc: NatsConnection;
  private sc = StringCodec();

  async onModuleInit() {
    this.nc = await connect({ servers: 'nats://localhost:4222' });
    console.log('Connected to NATS');
  }

  async onModuleDestroy() {
    await this.nc.drain();
    console.log('Disconnected from NATS');
  }

  belowMinThres(product: Product): void {
    this.nc.publish('warehouse.critical.belowMin', this.sc.encode(JSON.stringify(product)));
  }

  aboveMaxThres(product: Product): void {
    this.nc.publish('warehouse.critical.aboveMax', this.sc.encode(JSON.stringify(product)));
  }

  stockAdded(product: Product, warehouseId: string): void {
    this.nc.publish(
      'warehouse.stock.added',
      this.sc.encode(JSON.stringify({ product, warehouseId })),
    );
  }

  stockRemoved(productId: string, warehouseId: string): void {
    this.nc.publish(
      'warehouse.stock.removed',
      this.sc.encode(JSON.stringify({ productId, warehouseId })),
    );
  }

  stockUpdated(product: Product, warehouseId: string): void {
    this.nc.publish(
      'warehouse.stock.updated',
      this.sc.encode(JSON.stringify({ product, warehouseId })),
    );
  }

  insufficientProductAvailability(): void {
    this.nc.publish('warehouse.availability.insufficient', this.sc.encode('{}'));
  }

  sufficientProductAvailability(): void {
    this.nc.publish('warehouse.availability.sufficient', this.sc.encode('{}'));
  }

  requestRestock(productId: string, number: number): void {
    this.nc.publish(
      'warehouse.restock.request',
      this.sc.encode(JSON.stringify({ productId, number })),
    );
  }
}
