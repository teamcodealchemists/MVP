import { WarehouseId } from 'src/domain/warehouseId.entity';
import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { ProductDto } from "./dto/product.dto";
import { WarehouseIdDto } from "./dto/warehouseId.dto";
import { ProductIdDto } from "./dto/productId.dto";
import { OrderIdDTO } from "./dto/orderId.dto";
import { ProductQuantityArrayDto } from "./dto/productQuantityArray.dto";
@Injectable()
export class OutboundEventHandler implements OnModuleInit {
  private readonly logger = new Logger(OutboundEventHandler.name);
  constructor(
    @Inject("NATS_SERVICE") private readonly natsClient: ClientProxy,
  ) {}
  
  async onModuleInit() {
    try {
      await this.natsClient.connect();
    } catch (error) {
      this.logger.error('Error connecting to NATS service', error);
    }
  }
  
  async handlerBelowMinThres(product: ProductDto): Promise<void> {
    this.logger.warn(`belowMinThres → ${product.name}`);
    this.natsClient.emit("inventory.belowMinThres", JSON.stringify({ product }));
    return Promise.resolve();
  }

  async handlerAboveMaxThres(product: ProductDto): Promise<void> {
    this.logger.warn(`aboveMaxThres → ${product.name}`);
    this.natsClient.emit("inventory.aboveMaxThres", JSON.stringify({ product }));
    return Promise.resolve();
  }

  async handlerStockAdded(product: ProductDto): Promise<void>{
    this.logger.log(`stockAdded → ${product.name} @ warehouse ${product.warehouseId.warehouseId}`);
    this.natsClient.emit('inventory.stock.added', JSON.stringify({ product }));
    return Promise.resolve();
  }

  async handlerStockRemoved(productId: ProductIdDto, warehouseId: WarehouseIdDto): Promise<void>{
    this.logger.log(`stockRemoved → ${productId} @ warehouse ${warehouseId.warehouseId}`);
    this.natsClient.emit("inventory.stock.removed", JSON.stringify({ productId , warehouseId}));
    return Promise.resolve();
  }

  async handlerStockUpdated(product: ProductDto): Promise<void>{
    this.logger.log(`stockUpdated → ${product.name} @ warehouse ${product.warehouseId.warehouseId}`);
    this.natsClient.emit("inventory.stock.updated", JSON.stringify({ product }));
    return Promise.resolve();
  }

  async handlerSufficientProductAvailability(orderId : OrderIdDTO): Promise<void> {
    this.logger.log("sufficientProductAvailability");
    this.natsClient.emit("inventory.sufficientAvailability", JSON.stringify({orderId}));
    return Promise.resolve();
  }

  async handlerReservetionQuantities(product : ProductQuantityArrayDto): Promise<void> {
    this.logger.log(`reservetion → ${product.productQuantityArray}, qty=${product.productQuantityArray}`);
    this.natsClient.emit("inventory.reservetionQuantities", JSON.stringify({product}));
    return Promise.resolve();
  }
  
  async handlerStockShipped(orderId : OrderIdDTO): Promise<void> {

    this.natsClient.emit("inventory.stockShipped", JSON.stringify({ orderId }));  //su questo file spec se si modificano qualsiasi stringa bisogna controllare
    return Promise.resolve();
  }

  async handlerStockReceived(orderId : OrderIdDTO): Promise<void> {

    this.natsClient.emit("inventory.stockReceived", JSON.stringify({ orderId }));  //su questo file spec se si modificano qualsiasi stringa bisogna controllare
    return Promise.resolve();
  }
}