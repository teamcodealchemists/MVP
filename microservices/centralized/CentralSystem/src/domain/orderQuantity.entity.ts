import { OrderId } from './orderId.entity';
import { OrderItem } from './orderItem.entity';

export class OrderQuantity {
    constructor(
        private id: OrderId,
        private items: OrderItem[],
    ) { }

    getItemId(): OrderItem[] {
        return this.items;
    }

    getQuantity(): number[] {
        const qs: number[] = [];

        for (const item of this.items) {
            qs.push(item.getQuantity());
        }
        return qs;
    }

    setQuantity(id, newQuantity): void {
        this.items[id].setQuantity(newQuantity);
    }
    
    getId(): string {
        return this.id.getId();
    }

    getOrderType(): string {
        return this.id.getOrderType().charAt(0);
    }
}
