import { ProductId } from './productId.entity';

export class Product {
    constructor(
        private id: ProductId,
        private name: string,
        private unitPrice: number,
        private quantity: number,
        private minThres: number,
        private maxThres: number
    ) { }

    getId(): ProductId {
        return this.id;
    }
    getName(): string {
        return this.name;
    }
    getUnitPrice(): number {
        return this.unitPrice;
    }    
    getQuantity(): number {
        return this.quantity;
    }
    getMinThres(): number {
        return this.minThres;
    }
    getMaxThres(): number {
        return this.maxThres;
    }
}