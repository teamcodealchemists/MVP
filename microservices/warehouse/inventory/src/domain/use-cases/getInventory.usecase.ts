import { InventoryDto } from 'src/interfaces/dto/inventory.dto';

export interface getInventoryUseCase {
  getInventory(): Promise<InventoryDto>;

}