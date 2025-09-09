import { SyncOrderId } from "./syncOrderId.entity";
import { SyncOrderItemDetail } from "./syncOrderItemDetail.entity";
import { SyncOrderState } from "./syncOrderState.enum";

export abstract class SyncOrder {
    constructor(
        private orderId: SyncOrderId,
        private items: SyncOrderItemDetail[],
        private orderState: SyncOrderState,
        private creationDate: Date,
        private warehouseDeparture: number,
    ) { }

    getOrderId(): string {
    return this.orderId.getId();
    }
    getItemsDetail(): SyncOrderItemDetail[] {
        return this.items;
    }
    getOrderState(): SyncOrderState{
        return this.orderState;
    }
    getCreationDate(): Date {
        return this.creationDate;
    }
    getWarehouseDeparture(): number {
        return this.warehouseDeparture;
    }

    setItemsDetail(newItems: SyncOrderItemDetail[]): void {
        this.items = newItems;
    }
    setOrderState(newState: SyncOrderState): void {
        this.orderState = newState;
    }
    setCreationDate(newCreationDate: Date): void {
        this.creationDate = newCreationDate;
    } 
    setWarehouseDeparture (newWarehouseDeparture: number): void {
        this.warehouseDeparture = newWarehouseDeparture;
    }
}