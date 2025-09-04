import { Product } from 'src/domain/product.entity';
import { CriticalThresEventPort } from '../../domain/ports/critical-thres-event.port';
import { StockAddedPort } from 'src/domain/ports/stock-added.port';
import { StockRemovedPort } from 'src/domain/ports/stock-removed.port';
import { StockUpdatedPort } from 'src/domain/ports/stock-updated.port';
import { ResultProductAvailabilityPublisher } from 'src/domain/ports/result-product-availability.publisher';
import { RestockingRequestPort } from 'src/domain/ports/restocking-request.port';
import { OutboundEventHandler } from 'src/interfaces/OutboundEventHandler';
import { ProductDto } from 'src/interfaces/dto/product.dto';

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

  async belowMinThres(product: Product): Promise<void> {
    //conversione domain -- dto
    const p = new ProductDto();
    await this.outboundEventHandler.handlerBelowMinThres(p);
    return Promise.resolve();
  }

  async aboveMaxThres(product: Product): Promise<void> {
     //conversione domain -- dto
    return Promise.resolve();
  }

  async stockAdded(product: Product, warehouseId: number): Promise<void> {
     //conversione domain -- dto
    return Promise.resolve();
  } 

  async stockRemoved(productId: string, warehouseId: number): Promise<void> {
      //conversione domain -- dto
    return Promise.resolve();
  }

  async stockUpdated(product: Product, warehouseId: number): Promise<void> {
       //conversione domain -- dto
    return Promise.resolve();
  }

  async insufficientProductAvailability(): Promise<void> {
       //conversione domain -- dto
    return Promise.resolve();
  }

  async sufficientProductAvailability(): Promise<void> {
     //conversione domain -- dto
    return Promise.resolve();
  }

  async requestRestock(productId: string, number: number): Promise<void> {
     //conversione domain -- dto
    return Promise.resolve();
  }
}
