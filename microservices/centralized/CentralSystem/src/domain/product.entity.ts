import { warehouseIdDto } from 'src/interfaces/http/dto/warehouseId.dto';
import { ProductId } from './productId.entity';
import { WarehouseId } from './warehouseId.entity';
export class Product {
    constructor(
        private id: ProductId,
        private name: string,
        private unitPrice: number,
        private quantity: number,
        private minThres: number,
        private maxThres: number,
        private warehouseId : WarehouseId
    ) { }

    getId(): string {
        return this.id.getId();
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
    getIdWarehouse(): number {
        return this.warehouseId.getId();
    }
    setName(newName: string): void {
        this.name = newName;
    }
    setUnitPrice(newUnitPrice): void {
        this.unitPrice = newUnitPrice;
    }    
    setQuantity(newQuantity): void {
        this.quantity = newQuantity;
    }
    setMinThres(newMinThres): void {
        this.minThres = newMinThres;
    }
    setMaxThres(newMaxThres): void {
        this.maxThres = newMaxThres;
    }
}