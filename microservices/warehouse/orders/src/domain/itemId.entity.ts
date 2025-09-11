export class ItemId {
    constructor(
        private id: number,
    ) { 
        this.id = id;
    }

    getId(): number {
        return this.id;
    }
}