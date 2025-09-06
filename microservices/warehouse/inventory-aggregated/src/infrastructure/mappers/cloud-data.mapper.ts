import { Injectable } from '@nestjs/common';
import { SyncProductDTO } from '../../interfaces/dto/syncProduct.dto';
import { SyncProductIdDTO } from '../../interfaces/dto/syncProductId.dto';
import { SyncWarehouseIdDTO } from '../../interfaces/dto/syncWarehouseId.dto';
import { SyncInventoryDTO } from '../../interfaces/dto/syncInventory.dto';
import { Product } from '../../domain/product.entity';
import { ProductId } from '../../domain/productId.entity';
import { WarehouseId } from '../../domain/warehouseId.entity';
import { InventoryAggregated } from '../../domain/inventory-aggregated.entity';

@Injectable()
export class CloudDataMapper {

  toDomainProduct(syncProductDTO: SyncProductDTO): Product {
  let wId = new WarehouseId(syncProductDTO.warehouseId.warehouseId);
  return new Product(
  new ProductId(syncProductDTO.id),
  syncProductDTO.name,
  syncProductDTO.unitPrice,
  syncProductDTO.quantity,
  syncProductDTO.quantityReserved,
  syncProductDTO.minThres,
  syncProductDTO.maxThres,
  wId,
);

  }

  toDomainProductId(syncProductIdDTO: SyncProductIdDTO): ProductId {
    return new ProductId(syncProductIdDTO.id);
  }

  toDomainWarehouseId(syncWarehouseIdDTO: SyncWarehouseIdDTO): WarehouseId {
    return new WarehouseId(syncWarehouseIdDTO.warehouseId);
  }

  toDomainInventoryAggregated(syncInventoryDTO: SyncInventoryDTO): InventoryAggregated {
    const products = syncInventoryDTO.productList.map(p =>
      this.toDomainProduct(p)
    );
    return new InventoryAggregated(products);
  }


  toDTOProduct(product: Product): SyncProductDTO {
    let wIdDto = new SyncWarehouseIdDTO();
    wIdDto.warehouseId = product.getWarehouseId().getId();
    return {
      id: product.getId().getId(),
      name: product.getName(),
      unitPrice: product.getUnitPrice(),
      quantity: product.getQuantity(),
      quantityReserved: product.getQuantityReserved(),
      minThres: product.getMinThres(),
      maxThres: product.getMaxThres(),
      warehouseId: wIdDto,
    };
  }

  toDTOProductId(productId: ProductId): SyncProductIdDTO {
    return { id: productId.getId() };
  }

  toDTOWarehouseId(warehouseId: WarehouseId): SyncWarehouseIdDTO {
    return { warehouseId: warehouseId.getId() };
  }

  toDTOInventoryAggregated(inventory: InventoryAggregated): SyncInventoryDTO {
    return {
      productList: inventory.getInventory().map(p => this.toDTOProduct(p)),
    };
  }
}
