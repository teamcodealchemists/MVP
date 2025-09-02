import { SellOrder } from "./sellOrder.entity";
import { InternalOrder } from "./internalOrder.entity";

export class Orders {
    constructor(
        private internalOrders: InternalOrder[],
        private sellOrders: SellOrder[],
    ) { }

    getSellOrders(): SellOrder[] {
    return this.sellOrders;
    }
    getInternalOrders(): InternalOrder[] {
        return this.internalOrders;
    }

    setSellOrders(newSellOrders: SellOrder[]): void {
        this.sellOrders = newSellOrders;
    }
    setInternalOrders(newInternalOrders: InternalOrder[]): void {
        this.internalOrders = newInternalOrders;
    } 
}