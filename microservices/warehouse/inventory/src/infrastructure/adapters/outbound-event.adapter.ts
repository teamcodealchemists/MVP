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
import { ProductIdDto } from 'src/interfaces/dto/productId.dto';
import { WarehouseIdDto } from 'src/interfaces/dto/warehouseId.dto';
import { OrderIdDTO } from 'src/interfaces/dto/orderId.dto';

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

  async belowMinThres(product: Product , warehouseId : WarehouseId): Promise<void> {
    const idDto = new ProductIdDto();
    idDto.id = product.getId().getId();
    const whIdDto = new WarehouseIdDto();
    whIdDto.warehouseId = warehouseId.getId();
    const p: ProductDto = {
    id: idDto,
    name: product.getName(),
    unitPrice: product.getUnitPrice(),
    quantity: product.getQuantity(),
    quantityReserved : product.getQuantityReserved(),
    minThres: product.getMinThres(),
    maxThres: product.getMaxThres(),
    warehouseId: whIdDto,
    };
    this.outboundEventHandler.handlerBelowMinThres(p);
    return Promise.resolve();
  }

  async aboveMaxThres(product: Product, warehouseId : WarehouseId): Promise<void> {
    const idDto = new ProductIdDto();
    idDto.id = product.getId().getId();
    const whIdDto = new WarehouseIdDto();
    whIdDto.warehouseId = warehouseId.getId();
    const p: ProductDto = {
    id: idDto,
    name: product.getName(),
    unitPrice: product.getUnitPrice(),
    quantity: product.getQuantity(),
    quantityReserved : product.getQuantityReserved(),
    minThres: product.getMinThres(),
    maxThres: product.getMaxThres(),
    warehouseId: whIdDto,
    };
    this.outboundEventHandler.handlerBelowMinThres(p);
    return Promise.resolve();
  }

  async stockAdded(product: Product, warehouseId: WarehouseId): Promise<void> {
    const idDto = new ProductIdDto();
    idDto.id = product.getId().getId();
    const whIdDto = new WarehouseIdDto();
    whIdDto.warehouseId = warehouseId.getId();
    const p: ProductDto = {
    id: idDto,
    name: product.getName(),
    unitPrice: product.getUnitPrice(),
    quantity: product.getQuantity(),
    quantityReserved : product.getQuantityReserved(),
    minThres: product.getMinThres(),
    maxThres: product.getMaxThres(),
    warehouseId: whIdDto,
    };
    this.outboundEventHandler.handlerStockAdded(p);
    return Promise.resolve();
  } 

  async stockRemoved(productId: ProductId, warehouseId: WarehouseId): Promise<void> {
    const whIdDto = new WarehouseIdDto();
    whIdDto.warehouseId = warehouseId.getId();
    const idDto = new ProductIdDto();
    idDto.id = productId.getId();
    this.outboundEventHandler.handlerStockRemoved(idDto,whIdDto);
    return Promise.resolve();
  }

  async stockUpdated(product: Product, warehouseId: WarehouseId): Promise<void> {
    const idDto = new ProductIdDto();
    idDto.id = product.getId().getId();
    const whIdDto = new WarehouseIdDto();
    whIdDto.warehouseId = warehouseId.getId();
    const p: ProductDto = {
    id: idDto,
    name: product.getName(),
    unitPrice: product.getUnitPrice(),
    quantity: product.getQuantity(),
    quantityReserved : product.getQuantityReserved(),
    minThres: product.getMinThres(),
    maxThres: product.getMaxThres(),
    warehouseId: whIdDto,
    };
    this.outboundEventHandler.handlerStockUpdated(p);
    return Promise.resolve();
  }

  async sufficientProductAvailability(order : OrderId): Promise<void> {
     const oIdDto = new OrderIdDTO();
     oIdDto.id = order.getId();
     this.outboundEventHandler.handlerSufficientProductAvailability(oIdDto);
    return Promise.resolve();
  }

  async reservedQuantities(orderId: OrderId, product : ProductQuantity[]): Promise<void> {
    const oIdDto = new OrderIdDTO();
    oIdDto.id = orderId.getId();
    return Promise.resolve();
  }
}
