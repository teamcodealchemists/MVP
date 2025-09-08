import { SyncItemId } from './syncItemId.entity';

export class SyncOrderItem {
    constructor(
        private itemId: SyncItemId,
        private quantity: number,
    ) { }

    getItemId(): SyncItemId {
        return this.itemId;
    }
    getQuantity(): number {
        return this.quantity;
    }

    setQuantity(newQuantity): void {
        this.quantity = newQuantity;
    }
}
