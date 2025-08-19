import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { InventoryService } from 'src/application/inventory.service';
import { productDto } from '../interfaces/http/dto/product.dto';
import { productIdDto } from '../interfaces/http/dto/productId.dto';
import { DataMapper} from '../infrastructure/mappers/dataMapper'

@Controller()
export class CommandHandler {
  constructor(private readonly inventoryService: InventoryService) {}

  @MessagePattern(`api.warehouse.${process.env.WAREHOUSE_ID}.getHello`)
  getHello(): Promise<string> {
    return this.inventoryService.getHello();
  }

   @MessagePattern(`api.warehouse.${process.env.WAREHOUSE_ID}.newStock`)
  handleNewStock(productDTO: productDto): Promise<void> {
    const product = DataMapper.toDomainProduct(productDTO);
    return this.inventoryService.addProduct(product);
  }

  @MessagePattern(`api.warehouse.${process.env.WAREHOUSE_ID}.removeStock`)
  handleRemoveStock(productIdDTO: productIdDto): Promise<boolean> {
    const productId = DataMapper.toDomainProductId(productIdDTO);
  return this.inventoryService.removeProduct(productId);
  }


}
