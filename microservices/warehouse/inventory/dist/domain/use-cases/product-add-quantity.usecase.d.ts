import { productQuantityDto } from 'src/interfaces/http/dto/productQuantity.dto';
import { InventoryService } from '../../application/inventory.service';
export declare class ProductAddQuantityUseCase {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    addQuantity(dto: productQuantityDto): void;
}
