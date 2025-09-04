import { Injectable } from '@nestjs/common';
import { productQuantityDto } from 'src/interfaces/dto/productQuantity.dto';
export interface ProductAddQuantityUseCase {
  addQuantity(dto: productQuantityDto): void ;
}