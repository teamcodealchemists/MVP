import { ProductId } from "./productId.entity";
import { WarehouseId } from "./warehouseId.entity";

export class Product {
    constructor(
        private id: ProductId,
        private name: string,
        private unitPrice: number,
        private quantity: number,
        private minThres: number,
        private maxThres: number,
        private warehouseId: WarehouseId
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
    getWarehouseId(): string{
        return this.warehouseId.getId();
    }

    setName(newName: string): void {
        this.name = newName;
    }
    setUnitPrice(newUnitPrice : any): void {
        this.unitPrice = newUnitPrice;
    }    
    setQuantity(newQuantity: number): void {
        this.quantity = newQuantity;
    }
    setMinThres(newMinThres : number): void {
        this.minThres = newMinThres;
    }
    setMaxThres(newMaxThres: number): void {
        this.maxThres = newMaxThres;
    }
}