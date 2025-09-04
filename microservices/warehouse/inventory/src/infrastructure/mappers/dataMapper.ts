// DataMapper.ts
import { Product } from '../../domain/product.entity';
import { ProductId } from '../../domain/productId.entity';
import { Inventory } from '../../domain/inventory.entity';
import { WarehouseId } from '../../domain/warehouseId.entity';
import { ProductQuantity } from 'src/domain/productQuantity.entity';

import { ProductDto } from '../../interfaces/dto/product.dto';
import { ProductIdDto } from '../../interfaces/dto/productId.dto';
import { InventoryDto } from '../../interfaces/dto/inventory.dto';
import { WarehouseIdDto } from '../../interfaces/dto/warehouseId.dto';
import { BelowMinThresDto } from '../../interfaces/dto/belowMinThres.dto';
import { AboveMaxThresDto } from '../../interfaces/dto/aboveMaxThres.dto';
import { ProductQuantityDto } from '../../interfaces/dto/productQuantity.dto';
import { ProductQuantityArrayDto } from 'src/interfaces/dto/productQuantityArray.dto';

export const DataMapper = {
  toDomainProductId(productIdDTO: ProductIdDto): ProductId {
    return new ProductId(productIdDTO.id);
  },
  
  toDomainProduct(productDTO: ProductDto): Product {
    return new Product(
      new ProductId(productDTO.id.id),
      productDTO.name,
      productDTO.unitPrice,
      productDTO.quantity,
      productDTO.quantityReserved,
      productDTO.minThres,
      productDTO.maxThres
    );
  },

  toDomainInventory(inventoryDTO: InventoryDto): Inventory {
    const products = inventoryDTO.productList.map(DataMapper.toDomainProduct);
    return new Inventory(products);
  },

  toDomainProductQuantityArray(productQuantityArrayDto: ProductQuantityArrayDto): ProductQuantity[] {
    return productQuantityArrayDto.productQuantityArray.map(pq => new ProductQuantity(
      new ProductId(pq.productId.id),
      pq.quantity
    ));
  },

  toDTOProductId(productId: ProductId): ProductIdDto {
    return {
      id: productId.getId(),
    };
  },
  
  toDtoInventory(inventory: Inventory): InventoryDto {
    return {
      productList: inventory.getInventory().map(product => ({
        id: { id: product.getId().getId() },
        name: product.getName(),
        unitPrice: product.getUnitPrice(),
        quantity: product.getQuantity(),
        quantityReserved: product.getQuantityReserved(),
        minThres: product.getMinThres(),
        maxThres: product.getMaxThres(),
        warehouseId: { warehouseId: Number(process.env.WAREHOUSE_ID) },
      })),
    };
  },
  toDTO(warehouseId: WarehouseId): WarehouseIdDto {
    return {
      warehouseId: warehouseId.getId(),
    };
  },
  toBelowMinDTO(product: Product): BelowMinThresDto {
    return {
      id: { id: product.getId().getId() },
      quantity: product.getQuantity(),
      minThres: product.getMinThres(),
    };
  },
  toAboveMaxDTO(product: Product): AboveMaxThresDto {
    return {
      id: { id: product.getId().getId() },
      quantity: product.getQuantity(),
      maxThres: product.getMaxThres(),
    };
  },
  toDTOProductQuantity(productId: ProductId, quantity: number): ProductQuantityDto {
    return {
      productId: { id: productId.getId() },
      quantity: quantity,
    };
  },
};
