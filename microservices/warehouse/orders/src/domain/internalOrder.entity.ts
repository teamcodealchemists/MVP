import { Order } from "./order.entity";
import { OrderId } from "./orderId.entity";
import { OrderItemDetail } from "./orderItemDetail.entity";
import { OrderState } from "./orderState.enum";

export class InternalOrder extends Order {
    constructor (
        orderId: OrderId,
        items: OrderItemDetail[],
        orderState: OrderState,
        creationDate: Date,
        warehouseDeparture: number,
        private warehouseDestination: number,
        private sellOrderReference : OrderId
    ) { 
        super(orderId, items, orderState, creationDate, warehouseDeparture); 
    }

    getWarehouseDestination(): number {
        return this.warehouseDestination;
    }

    setWarehouseDestination(newWarehouseDestination: number): void {
        this.warehouseDestination = newWarehouseDestination;
    }
    getSellOrderReference(): OrderId {
        return this.sellOrderReference;
    }

    setSellOrderReference(newSellOrderReference: OrderId): void {
        this.sellOrderReference = newSellOrderReference;
    }
}