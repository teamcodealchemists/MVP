
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { connect, NatsConnection, StringCodec } from 'nats';
import { Product } from 'src/domain/product.entity';
import { CriticalThresEventPort } from '../../domain/ports/critical-thres-event.port';
import { StockAddedPort } from 'src/domain/ports/stock-added.port';
import { StockRemovedPort } from 'src/domain/ports/stock-removed.port';
import { StockUpdatedPort } from 'src/domain/ports/stock-updated.port';
import { ResultProductAvailabilityPublisher } from 'src/domain/ports/result-product-availability.publisher';
import { RestockingRequestPort } from 'src/domain/ports/restocking-request.port';
import { OutboundEventHandler } from 'src/interfaces/OutboundEventHandler';

@Injectable()
export class OutboundEventAdapter
  implements
    CriticalThresEventPort,
    StockAddedPort,
    StockRemovedPort,
    StockUpdatedPort,
    ResultProductAvailabilityPublisher,
    RestockingRequestPort
{
  constructor(private readonly outboundEventHandler : OutboundEventHandler) {}

  belowMinThres(product: Product): void {
    
  }

  aboveMaxThres(product: Product): void {
    
  }

  stockAdded(product: Product, warehouseId: number): void {
   
  }

  stockRemoved(productId: string, warehouseId: number): void {
   
  }

  stockUpdated(product: Product, warehouseId: number): void {
   
  }

  insufficientProductAvailability(): void {
    
  }

  sufficientProductAvailability(): void {
   
  }

  requestRestock(productId: string, number: number): void {
    
  }
}
