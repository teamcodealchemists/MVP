import { ProductId } from "src/domain/productId.entity";
import { Command } from "./command";
import { InventoryService } from "src/application/inventory.service";

export class removeProductCommand implements Command {
    constructor(
        private readonly inventoryService: InventoryService,
        private id: ProductId) {}
    execute(): Promise<string> {
        return this.inventoryService.getHello();
    }
}