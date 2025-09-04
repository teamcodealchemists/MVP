import { Injectable } from '@nestjs/common';
import { ProductAddQuantityUseCase } from 'src/domain/use-cases/product-add-quantity.usecase';
import { OrderRequestUseCase } from 'src/domain/use-cases/order-request.usecase';
import { productQuantityDto } from 'src/interfaces/dto/productQuantity.dto';
import { productQuantityArrayDto } from 'src/interfaces/dto/productQuantityArray.dto';
import { InventoryService } from 'src/application/inventory.service';

@Injectable()
export class InboundEventListener implements OrderRequestUseCase, ProductAddQuantityUseCase{
  constructor(private readonly service : InventoryService ) {}
  orderRequest(dto: productQuantityArrayDto): boolean {
    console.log('Ricevuta richiesta ordine:', dto);
    const result = await this.service.processOrder(dto);
    return Promise.resolve(result); 
  }

  addQuantity(dto: productQuantityDto): void {
    console.log('Aggiunta quantità prodotto:', dto);
    this.service.addProductQuantity(dto);
    return Promise.resolve();
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
