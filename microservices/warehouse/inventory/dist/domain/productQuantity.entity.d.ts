import { ProductId } from './productId.entity';
export declare class ProductQuantity {
    private id;
    private quantity;
    constructor(id: ProductId, quantity: number);
    getId(): ProductId;
    getQuantity(): number;
}
