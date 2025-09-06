import { ProductId } from './productId.entity';

export class ProductQuantity {
    constructor(
        private id: ProductId,
        private quantity: number
    ) { }

    getId(): ProductId {
        return this.id;
    }
    getQuantity(): number {
        return this.quantity;
    }
}