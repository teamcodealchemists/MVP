import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { ProductDto } from "./dto/product.dto";
import { WarehouseIdDto } from "./dto/warehouseId.dto";
import { ProductId } from "src/domain/productId.entity";
import { ProductQuantityDto } from "./dto/productQuantity.dto";
@Injectable()
export class OutboundEventHandler implements OnModuleInit {
  private readonly logger = new Logger(OutboundEventHandler.name);
  constructor(
    @Inject("NATS_SERVICE") private readonly natsClient: ClientProxy,
  ) {}
  
  async onModuleInit() {
    await this.natsClient.connect();
  }
  async handlerBelowMinThres(product: ProductDto): Promise<void> {
    this.logger.warn(`belowMinThres → ${product.name}`);
    this.natsClient.emit("inventory.belowMinThres", { product });
    return Promise.resolve();
  }

  async handlerAboveMaxThres(product: ProductDto): Promise<void> {
    this.logger.warn(`aboveMaxThres → ${product.name}`);
    this.natsClient.emit("inventory.aboveMaxThres", { product });
    return Promise.resolve();
  }

  async handlerStockAdded(product: ProductDto, warehouseId: WarehouseIdDto): Promise<void>{
    this.logger.log(`stockAdded → ${product.name} @ warehouse ${warehouseId.warehouseId}`);
    this.natsClient.emit("inventory.stockAdded", { product, warehouseId });
    return Promise.resolve();
  }

  async handlerStockRemoved(productId: ProductId, warehouseId: WarehouseIdDto): Promise<void>{
    this.logger.log(`stockRemoved → ${productId} @ warehouse ${warehouseId.warehouseId}`);
    this.natsClient.emit("inventory.stockRemoved", { productId, warehouseId });
    return Promise.resolve();
  }

  async handlerStockUpdated(product: ProductDto, warehouseId: WarehouseIdDto): Promise<void>{
    this.logger.log(`stockUpdated → ${product.name} @ warehouse ${warehouseId.warehouseId}`);
    this.natsClient.emit("inventory.stockUpdated", { product, warehouseId });
    return Promise.resolve();
  }

  async handlerInsufficientProductAvailability(): Promise<void> {
    this.logger.warn("insufficientProductAvailability");
    this.natsClient.emit("inventory.insufficientAvailability", {});
    return Promise.resolve();
  }

  async handlerSufficientProductAvailability(): Promise<void> {
    this.logger.log("sufficientProductAvailability");
    this.natsClient.emit("inventory.sufficientAvailability", {});
    return Promise.resolve();
  }

  async handlerRequestRestock(product : ProductQuantityDto): Promise<void> {
    this.logger.log(`requestRestock → ${product.productId}, qty=${product.quantity}`);
    this.natsClient.emit("inventory.requestRestock", { product });
    return Promise.resolve();
  }
}