import { Order } from "./order.entity";
import { OrderId } from "./orderId.entity";
import { OrderItemDetail } from "./orderItemDetail.entity";
import { OrderState } from "./orderState.enum";

export class SellOrder extends Order {
    constructor (
        orderId: OrderId,
        items: OrderItemDetail[],
        orderState: OrderState,
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