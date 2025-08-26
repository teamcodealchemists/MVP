import { productQuantityArrayDto } from 'src/interfaces/http/dto/productQuantityArray.dto';
import { InventoryService } from '../../application/inventory.service';
export declare class OrderRequestUseCase {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    orderRequest(dto: productQuantityArrayDto): boolean;
}
