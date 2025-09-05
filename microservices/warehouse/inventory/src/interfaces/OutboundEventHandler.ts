import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { ProductDto } from "./dto/product.dto";
import { WarehouseIdDto } from "./dto/warehouseId.dto";
import { ProductId } from "src/domain/productId.entity";
import { ProductQuantityDto } from "./dto/productQuantity.dto";
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
    await this.natsClient.connect();
  }
  async handlerBelowMinThres(product: ProductDto): Promise<void> {
    this.logger.warn(`belowMinThres → ${product.name}`);
    this.natsClient.emit("inventory.belowMinThres", { productJson : JSON.stringify(product, null, 2) });
    return Promise.resolve();
  }

  async handlerAboveMaxThres(product: ProductDto): Promise<void> {
    this.logger.warn(`aboveMaxThres → ${product.name}`);
    this.natsClient.emit("inventory.aboveMaxThres", { productJson : JSON.stringify(product, null, 2) });
    return Promise.resolve();
  }

  async handlerStockAdded(product: ProductDto): Promise<void>{
    this.logger.log(`stockAdded → ${product.name} @ warehouse ${product.warehouseId}`);
    this.natsClient.emit("inventory.stockAdded", { productJson : JSON.stringify(product, null, 2), warehouseIdJson : JSON.stringify(product.warehouseId, null, 2)  });
    return Promise.resolve();
  }

  async handlerStockRemoved(productId: ProductIdDto, warehouseId: WarehouseIdDto): Promise<void>{
    this.logger.log(`stockRemoved → ${productId} @ warehouse ${warehouseId.warehouseId}`);
    this.natsClient.emit("inventory.stockRemoved", { productIdJson : JSON.stringify(productId, null, 2), warehouseIdJson : JSON.stringify(warehouseId, null, 2)});
    return Promise.resolve();
  }

  async handlerStockUpdated(product: ProductDto): Promise<void>{
    this.logger.log(`stockUpdated → ${product.name} @ warehouse ${product.warehouseId}`);
    this.natsClient.emit("inventory.stockUpdated", { productJson : JSON.stringify(product, null, 2), warehouseIdJson : JSON.stringify(product.warehouseId, null, 2)  });
    return Promise.resolve();
  }

  async handlerSufficientProductAvailability(orderId : OrderIdDTO): Promise<void> {
    this.logger.log("sufficientProductAvailability");
    this.natsClient.emit("inventory.sufficientAvailability", {orderIdJson : JSON.stringify(orderId, null, 2)});
    return Promise.resolve();
  }

  async handlerReservetionQuantities(product : ProductQuantityArrayDto): Promise<void> {
    this.logger.log(`reservetion → ${product.productQuantityArray}, qty=${product.productQuantityArray}`);
    this.natsClient.emit("inventory.reservetionQuantities", { productJson : JSON.stringify(product, null, 2) });
    return Promise.resolve();
  }
  
  async handlerStockShipped(orderId : OrderIdDTO): Promise<void> {

    this.natsClient.emit("", { orderIdJson : JSON.stringify(orderId, null, 2) });
    return Promise.resolve();
  }

  async handlerStockReceived(orderId : OrderIdDTO): Promise<void> {
   
    this.natsClient.emit("", { productJson : JSON.stringify(orderId, null, 2) });
    return Promise.resolve();
  }
}