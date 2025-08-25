import { InventoryService } from 'src/application/inventory.service';
import { Product } from 'src/domain/product.entity';
import { Inventory } from 'src/domain/inventory.entity';
export declare class CommandHandler {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    handleNewStock(payload: any): Promise<void>;
    handleRemoveStock(payload: any): Promise<boolean>;
    handleEditStock(payload: any): Promise<void>;
    handleGetProduct(payload: any): Promise<Product | null>;
    handleGetInventory(): Promise<Inventory>;
}
