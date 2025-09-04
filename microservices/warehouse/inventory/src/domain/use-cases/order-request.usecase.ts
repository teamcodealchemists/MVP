import { Injectable } from '@nestjs/common';
import { productQuantityArrayDto } from 'src/interfaces/dto/productQuantityArray.dto';
import { InventoryService } from '../../application/inventory.service';

export interface OrderRequestUseCase {
  orderRequest(dto: productQuantityArrayDto): Promise<boolean>;
  shipOrderRequest(dto : productQuantityArrayDto) : Promise<void>;
}
