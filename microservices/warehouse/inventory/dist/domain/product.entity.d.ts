import { ProductId } from './productId.entity';
export declare class Product {
    private id;
    private name;
    private unitPrice;
    private quantity;
    private minThres;
    private maxThres;
    constructor(id: ProductId, name: string, unitPrice: number, quantity: number, minThres: number, maxThres: number);
    getId(): ProductId;
    getName(): string;
    getUnitPrice(): number;
    getQuantity(): number;
    getMinThres(): number;
    getMaxThres(): number;
    setName(newName: string): void;
    setUnitPrice(newUnitPrice: any): void;
    setQuantity(newQuantity: any): void;
    setMinThres(newMinThres: any): void;
    setMaxThres(newMaxThres: any): void;
}
