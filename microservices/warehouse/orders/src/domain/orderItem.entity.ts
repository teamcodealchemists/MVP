import { ItemId } from './itemId.entity';

export class OrderItem {
    constructor(
        private itemId: ItemId,
        private quantity: number,
    ) { }

    getItemId(): ItemId {
        return this.itemId;
    }
    getQuantity(): number {
        return this.quantity;
    }

    setQuantity(newQuantity): void {
        this.quantity = newQuantity;
    }
}
