import { SyncOrderItem } from './syncOrderItem.entity';

export class SyncOrderItemDetail {
    constructor(
        private item: SyncOrderItem,
        private quantityReserved: number,
        private unitPrice: number,
    ) { }

    getItem(): SyncOrderItem{
        return this.item;
    }    

    getQuantityReserved(): number {
        return this.quantityReserved;
    }
    getUnitPrice(): number {
        return this.unitPrice;
    }    

    setQuantityReserved(newQuantityReserved): void {
        this.quantityReserved = newQuantityReserved;
    }
    setUnitPrice(newUnitPrice): void {
        this.unitPrice = newUnitPrice;
    }    
}
