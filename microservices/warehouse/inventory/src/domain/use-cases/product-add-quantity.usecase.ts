import { Injectable } from '@nestjs/common';
import { productQuantityDto } from 'src/interfaces/dto/productQuantity.dto';
import { InventoryService } from '../../application/inventory.service';

@Injectable()
export class ProductAddQuantityUseCase {
  constructor(private readonly inventoryService: InventoryService) {}

  addQuantity(dto: productQuantityDto): void {
    // invoca il service per aggiornare la quantità del prodotto
    //this.inventoryService.addQuantity(dto.productId, dto.quantity);
  }
}
