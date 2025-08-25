import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { connect, NatsConnection, StringCodec, Subscription } from 'nats';
import { ProductAddQuantityUseCase } from 'src/domain/use-cases/product-add-quantity.usecase';
import { OrderRequestUseCase } from 'src/domain/use-cases/order-request.usecase';
import { productQuantityDto } from 'src/interfaces/http/dto/productQuantity.dto';
import { productQuantityArrayDto } from 'src/interfaces/http/dto/productQuantityArray.dto';

@Injectable()
export class InboundEventListener implements OnModuleInit, OnModuleDestroy {
  private nc: NatsConnection;
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
  }
}
