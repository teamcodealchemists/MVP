import { ItemId } from './itemId.entity';

export class OrderItem {
    constructor(
        private itemId: ItemId,
        private quantity: number,
    ) { }

    getItemId(): number {
        return this.itemId.getId();
    }
    getQuantity(): number {
        return this.quantity;
    }

    setQuantity(newQuantity): void {
        this.quantity = newQuantity;
    }
}
