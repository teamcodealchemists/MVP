import { SyncOrder } from "./syncOrder.entity";
import { SyncOrderId } from "./syncOrderId.entity";
import { SyncOrderItemDetail } from "./syncOrderItemDetail.entity";
import { SyncOrderState } from "./syncOrderState.enum";

export class SyncSellOrder extends SyncOrder {
    constructor (
        orderId: SyncOrderId,
        items: SyncOrderItemDetail[],
        orderState: SyncOrderState,
        creationDate: Date,
        warehouseDeparture: number,
        private destinationAddress : string,
    ) { 
        super(orderId, items, orderState, creationDate, warehouseDeparture); 
    }

    getDestinationAddress(): string {
        return this.destinationAddress;
    }

    setDestinationAddress(newDestinationAddress: string): void {
        this.destinationAddress = newDestinationAddress;
    }
}