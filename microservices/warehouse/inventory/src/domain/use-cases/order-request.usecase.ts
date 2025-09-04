import { Injectable } from '@nestjs/common';
import { productQuantityArrayDto } from 'src/interfaces/dto/productQuantityArray.dto';
import { InventoryService } from '../../application/inventory.service';

@Injectable()
export class OrderRequestUseCase {
  constructor(private readonly inventoryService: InventoryService) {}

  orderRequest(dto: productQuantityArrayDto): boolean {
    //return this.inventoryService.reserveProducts(dto.items);
    return true;
  }
}
