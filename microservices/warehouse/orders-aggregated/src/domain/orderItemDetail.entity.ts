import { OrderItem } from './orderItem.entity';

export class OrderItemDetail {
    constructor(
        private item: OrderItem,
        private quantityReserved: number,
        private unitPrice: number,
    ) { }

    getItem(): OrderItem{
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
