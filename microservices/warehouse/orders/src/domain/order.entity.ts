import { OrderId } from "./orderId.entity";
import { OrderItemDetail } from "./orderItemDetail.entity";
import { OrderState } from "./orderState.enum";

export abstract class Order {
    constructor(
        private orderId: OrderId,
        private items: OrderItemDetail[],
        private orderState: OrderState,
        private creationDate: Date,
        private warehouseDeparture: number,
    ) { }

    getOrderId(): string {
    return this.orderId.getId();
    }
    getItemsDetail(): OrderItemDetail[] {
        return this.items;
    }
    getOrderState(): OrderState{
        return this.orderState;
    }
    getCreationDate(): Date {
        return this.creationDate;
    }
    getWarehouseDeparture(): number {
        return this.warehouseDeparture;
    }

    setItemsDetail(newItems: OrderItemDetail[]): void {
        this.items = newItems;
    }
    setOrderState(newState: OrderState): void {
        this.orderState = newState;
    }
    setCreationDate(newCreationDate: Date): void {
        this.creationDate = newCreationDate;
    } 
    setWarehouseDeparture (newWarehouseDeparture: number): void {
        this.warehouseDeparture = newWarehouseDeparture;
    }
}