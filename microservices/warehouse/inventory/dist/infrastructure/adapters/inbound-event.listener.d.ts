import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ProductAddQuantityUseCase } from 'src/domain/use-cases/product-add-quantity.usecase';
import { OrderRequestUseCase } from 'src/domain/use-cases/order-request.usecase';
export declare class InboundEventListener implements OnModuleInit, OnModuleDestroy {
    private readonly addQuantityUseCase;
    private readonly orderRequestUseCase;
    private nc;
    private sc;
    private subAddQuantity;
    private subOrderRequest;
    constructor(addQuantityUseCase: ProductAddQuantityUseCase, orderRequestUseCase: OrderRequestUseCase);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
