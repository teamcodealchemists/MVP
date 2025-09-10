import { OrderId } from "src/domain/orderId.entity";

export interface WaitingForStockPublisher {
    waitingForStock(orderId: OrderId, warehouseDepartureId: string): Promise<void>;
}