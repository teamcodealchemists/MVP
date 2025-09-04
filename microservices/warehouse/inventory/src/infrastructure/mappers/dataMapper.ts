// DataMapper.ts
import { productDto } from '../../interfaces/dto/product.dto';
import { productIdDto } from '../../interfaces/dto/productId.dto';
import { inventoryDto } from '../../interfaces/dto/inventory.dto';
import { Product } from '../../domain/product.entity';
import { ProductId } from '../../domain/productId.entity';
import { Inventory } from '../../domain/inventory.entity';
import { WarehouseId } from '../../domain/warehouseId.entity';
import { warehouseIdDto } from '../../interfaces/dto/warehouseId.dto';
import { belowMinThresDto } from '../../interfaces/dto/belowMinThres.dto';
import { aboveMaxThresDto } from '../../interfaces/dto/aboveMaxThres.dto';
import { productQuantityDto } from '../../interfaces/dto/productQuantity.dto';

export const DataMapper = {
  toDomainProductId(productIdDTO: productIdDto): ProductId {
    return new ProductId(productIdDTO.id);
  },
  toDomainProduct(productDTO: productDto): Product {
    return new Product(
      new ProductId(productDTO.id),
      productDTO.name,
      productDTO.unitPrice,
      productDTO.quantity,
      productDTO.minThres,
      productDTO.maxThres
    );
  },
  toDomainInventory(inventoryDTO: inventoryDto): Inventory {
    const products = inventoryDTO.productList.map(DataMapper.toDomainProduct);
    return new Inventory(products);
  },
  toDtoProduct(product: Product): productDto {
    return {
      id: product.getId().getId(),
      name: product.getName(),
      unitPrice: product.getUnitPrice(),
      quantity: product.getQuantity(),
      minThres: product.getMinThres(),
      maxThres: product.getMaxThres(),
    };
  },
  toDTOProductId(productId: ProductId): productIdDto {
    return {
      id: productId.getId(),
    };
  },
  toDtoInventory(inventory: Inventory): inventoryDto {
    return {
      productList: inventory.getInventory().map(DataMapper.toDtoProduct),
    };
  },
  toDTO(warehouseId: WarehouseId): warehouseIdDto {
    return {
      warehouseId: parseInt(warehouseId.getId(), 10),
    };
  },
  toBelowMinDTO(product: Product): belowMinThresDto {
    return {
      id: product.getId().getId(),
      quantity: product.getQuantity(),
      minThres: product.getMinThres(),
    };
  },
  toAboveMaxDTO(product: Product): aboveMaxThresDto {
    return {
      id: product.getId().getId(),
      quantity: product.getQuantity(),
      maxThres: product.getMaxThres(),
    };
  },
  toDTOProductQuantity(productId: ProductId, quantity: number): productQuantityDto {
    return {
      productId: { id: productId.getId() },
      quantity: quantity,
    };
  },
};
