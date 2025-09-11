import { SyncSellOrder } from "./syncSellOrder.entity";
import { SyncInternalOrder } from "./syncInternalOrder.entity";

export class SyncOrders {
    constructor(
        private sellOrders: SyncSellOrder[],
        private internalOrders: SyncInternalOrder[],
    ) { }

    getSellOrders(): SyncSellOrder[] {
    return this.sellOrders;
    }
    getInternalOrders(): SyncInternalOrder[] {
        return this.internalOrders;
    }

    setSellOrders(newSellOrders: SyncSellOrder[]): void {
        this.sellOrders = newSellOrders;
    }
    setInternalOrders(newInternalOrders: SyncInternalOrder[]): void {
        this.internalOrders = newInternalOrders;
    } 
}