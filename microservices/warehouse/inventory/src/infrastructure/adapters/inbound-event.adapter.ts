import { Injectable } from '@nestjs/common';
import { ProductAddQuantityUseCase } from 'src/domain/use-cases/product-add-quantity.usecase';
import { OrderRequestUseCase } from 'src/domain/use-cases/order-request.usecase';
import { ProductQuantityDto } from 'src/interfaces/dto/productQuantity.dto';
import { ProductQuantityArrayDto } from 'src/interfaces/dto/productQuantityArray.dto';
import { InventoryService } from 'src/application/inventory.service';
import { DataMapper } from '../mappers/dataMapper';
import { ProductId } from 'src/domain/productId.entity';
import { Product } from 'src/domain/product.entity';

@Injectable()
export class InboundEventListener implements
OrderRequestUseCase,
ProductAddQuantityUseCase {
  constructor(private readonly service : InventoryService ) {}

  async orderRequest(productQuantityArrayDto: ProductQuantityArrayDto): Promise<boolean> {
    return await this.service.checkProductAvailability(DataMapper.toDomainProductQuantityArray(productQuantityArrayDto));
  }

  async addQuantity(productQuantityDto: ProductQuantityDto): Promise<void> {
    
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
