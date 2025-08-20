export class OrderId {
    constructor(
        private id: string,
    ) { 
        this.id = id;
    }

    getId(): string {
        return this.id;
    }

    getOrderType(): string {
        return this.id.charAt(0);
    }
}