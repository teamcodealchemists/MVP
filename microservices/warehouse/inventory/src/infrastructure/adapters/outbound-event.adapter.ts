import { Product } from 'src/domain/product.entity';
import { CriticalThresEventPort } from '../../domain/ports/critical-thres-event.port';
import { StockAddedPort } from 'src/domain/ports/stock-added.port';
import { StockRemovedPort } from 'src/domain/ports/stock-removed.port';
import { StockUpdatedPort } from 'src/domain/ports/stock-updated.port';
import { ResultProductAvailabilityPublisher } from 'src/domain/ports/result-product-availability.publisher';
import { ReservetionPort } from 'src/domain/ports/reservetion.port';
import { OutboundEventHandler } from 'src/interfaces/OutboundEventHandler';
import { ProductDto } from 'src/interfaces/dto/product.dto';
import { OrderId } from 'src/domain/orderId.entity';
import { ProductQuantity } from 'src/domain/productQuantity.entity';
import { WarehouseId } from 'src/domain/warehouseId.entity';
import { ProductId } from 'src/domain/productId.entity';

export class OutboundEventAdapter
  implements
    CriticalThresEventPort,
    StockAddedPort,
    StockRemovedPort,
    StockUpdatedPort,
    ResultProductAvailabilityPublisher,
    ReservetionPort
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

  async stockAdded(product: Product, warehouseId: WarehouseId): Promise<void> {
     //conversione domain -- dto
    return Promise.resolve();
  } 

  async stockRemoved(productId: ProductId, warehouseId: WarehouseId): Promise<void> {
      //conversione domain -- dto
    return Promise.resolve();
  }

  async stockUpdated(product: Product, warehouseId: WarehouseId): Promise<void> {
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

  async reservedQuantities(orderId: OrderId, product : ProductQuantity[]): Promise<void> {
     //conversione domain -- dto
    return Promise.resolve();
  }
}
