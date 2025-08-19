export class OrderId {
    constructor(
        private id: number,
    ) { 
        this.id = id;
    }

    getId(): number {
        return this.id;
    }
}