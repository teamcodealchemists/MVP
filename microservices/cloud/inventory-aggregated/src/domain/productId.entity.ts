export class ProductId {
    constructor(
        private id: string,
    ) { 
        this.id = id;
     }

    getId(): string {
        return this.id;
    }
}