import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Product } from 'src/domain/product.entity';
import { CriticalThresEventPort } from '../../domain/ports/critical-thres-event.port';
import { StockAddedPort } from 'src/domain/ports/stock-added.port';
import { StockRemovedPort } from 'src/domain/ports/stock-removed.port';
import { StockUpdatedPort } from 'src/domain/ports/stock-updated.port';
import { ResultProductAvailabilityPublisher } from 'src/domain/ports/result-product-availability.publisher';
import { RestockingRequestPort } from 'src/domain/ports/restocking-request.port';
export declare class OutboundEventAdapter implements OnModuleInit, OnModuleDestroy, CriticalThresEventPort, StockAddedPort, StockRemovedPort, StockUpdatedPort, ResultProductAvailabilityPublisher, RestockingRequestPort {
    private nc;
    private sc;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    belowMinThres(product: Product): void;
    aboveMaxThres(product: Product): void;
    stockAdded(product: Product, warehouseId: string): void;
    stockRemoved(productId: string, warehouseId: string): void;
    stockUpdated(product: Product, warehouseId: string): void;
    insufficientProductAvailability(): void;
    sufficientProductAvailability(): void;
    requestRestock(productId: string, number: number): void;
}
