import { SyncOrder } from "./syncOrder.entity";
import { SyncOrderId } from "./syncOrderId.entity";
import { SyncOrderItemDetail } from "./syncOrderItemDetail.entity";
import { SyncOrderState } from "./syncOrderState.enum";

export class SyncInternalOrder extends SyncOrder {
    constructor (
        orderId: SyncOrderId,
        items: SyncOrderItemDetail[],
        orderState: SyncOrderState,
        creationDate: Date,
        warehouseDeparture: number,
        private warehouseDestination: number,
    ) { 
        super(orderId, items, orderState, creationDate, warehouseDeparture); 
    }

    getWarehouseDestination(): number {
        return this.warehouseDestination;
    }

    setWarehouseDestination(newWarehouseDestination: number): void {
        this.warehouseDestination = newWarehouseDestination;
    }
}