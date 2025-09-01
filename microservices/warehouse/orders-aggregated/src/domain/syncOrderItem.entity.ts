import { SyncItemId } from './syncItemId.entity';

export class SyncOrderItem {
    constructor(
        private itemId: SyncItemId,
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
