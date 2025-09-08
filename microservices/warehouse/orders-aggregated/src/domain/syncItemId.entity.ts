export class SyncItemId {
    constructor(
        private id: number,
    ) { 
        this.id = id;
    }

    getId(): number {
        return this.id;
    }
}