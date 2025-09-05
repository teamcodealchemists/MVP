import { ProductAddQuantityUseCase } from 'src/domain/use-cases/product-add-quantity.usecase';
import { OrderRequestUseCase } from 'src/domain/use-cases/order-request.usecase';
import { ProductQuantityDto } from 'src/interfaces/dto/productQuantity.dto';
import { ProductQuantityArrayDto } from 'src/interfaces/dto/productQuantityArray.dto';
import { InventoryService } from 'src/application/inventory.service';
import { DataMapper } from '../mappers/dataMapper';
import { ProductId } from 'src/domain/productId.entity';
import { Product } from 'src/domain/product.entity';
import { Injectable } from '@nestjs/common';
import { EditStockUseCase } from 'src/domain/use-cases/editStock.usecase';
import { Inventory } from 'src/domain/inventory.entity';
import { ProductIdDto } from 'src/interfaces/dto/productId.dto';
import { ProductDto } from 'src/interfaces/dto/product.dto';

@Injectable()
export class InboundEventListener implements 
EditStockUseCase {
  constructor(private readonly service : InventoryService ) {}
   async newStock(dto: ProductDto): Promise<void> {
    const product = DataMapper.toDomainProduct(dto);
    await this.service.addProduct(product);
  }

  // rimozione stock
  async removeStock(dto: ProductIdDto): Promise<void> {
    const productId = new ProductId(dto.id);
    await this.service.removeProduct(productId);
  }

  // modifica stock
  async editStock(dto: ProductDto): Promise<void> {
    const product = DataMapper.toDomainProduct(dto);
    await this.service.editProduct(product);
  }

  // ottenere singolo prodotto
  async handleGetProduct(productId: ProductIdDto): Promise<Product | null> {
    const id = DataMapper.toDomainProductId(productId);
    return await this.service.getProduct(id);
  }

  // ottenere inventario completo
  async getInventory(): Promise<Inventory> {
    return Promise.resolve(await this.service.getInventory());
  }

  async orderRequest(dto: ProductQuantityArrayDto): Promise<boolean> {
    const { orderId, productQuantities } = DataMapper.toDomainProductQuantityArray(dto);
    await this.service.reserveStock(orderId, productQuantities);
    return true;
  }

  async addQuantity(dto: ProductQuantityDto): Promise<void> {
    const product = DataMapper.toDomainProductQuantity(dto);
    await this.service.addProductQuantity(product);
  }

  async shipOrderRequest(dto : ProductQuantityArrayDto) : Promise<void>{
    const { orderId, productQuantities } = DataMapper.toDomainProductQuantityArray(dto);
    await this.service.shipOrder(orderId, productQuantities);
  }
  async receiveShipment(dto : ProductQuantityArrayDto) : Promise<void>{
    const { orderId, productQuantities } = DataMapper.toDomainProductQuantityArray(dto);
    await this.service.shipOrder(orderId, productQuantities);
  }
  

}

  /*private nc: NatsConnection;
  private sc = StringCodec(); 
  private subAddQuantity: Subscription;
  private subOrderRequest: Subscription;

  constructor(
    private readonly addQuantityUseCase: ProductAddQuantityUseCase,
    private readonly orderRequestUseCase: OrderRequestUseCase,
  ) {}

  async onModuleInit() {
    this.nc = await connect({ servers: 'nats://localhost:4222' });

    // Subscribe a "add quantity"
    this.subAddQuantity = this.nc.subscribe('warehouse.product.addQuantity');
    (async () => {
      for await (const msg of this.subAddQuantity) {
        const dto: productQuantityDto = JSON.parse(this.sc.decode(msg.data));
        this.addQuantityUseCase.addQuantity(dto);
      }
    })();

    // Subscribe a "order request"
    this.subOrderRequest = this.nc.subscribe('warehouse.order.request');
    (async () => {
      for await (const msg of this.subOrderRequest) {
        const dto: productQuantityArrayDto = JSON.parse(this.sc.decode(msg.data));
        const result = this.orderRequestUseCase.orderRequest(dto);
        // opzionale: rispondi sul replyTo
        if (msg.reply) {
          this.nc.publish(msg.reply, this.sc.encode(JSON.stringify({ success: result })));
        }
      }
    })();
  }

  async onModuleDestroy() {
    await this.subAddQuantity?.unsubscribe();
    await this.subOrderRequest?.unsubscribe();
    await this.nc.drain();
  }*/
