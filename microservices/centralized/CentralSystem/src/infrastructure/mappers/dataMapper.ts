// DataMapper.ts
import { productDto } from '../../interfaces/http/dto/product.dto';
import { productIdDto } from '../../interfaces/http/dto/productId.dto';
import { inventoryDto } from '../../interfaces/http/dto/inventory.dto';
import { Product } from '../../domain/product.entity';
import { ProductId } from '../../domain/productId.entity';
import { Inventory } from '../../domain/inventory.entity';
import { WarehouseId } from '../../domain/warehouseId.entity';
import { warehouseIdDto } from '../../interfaces/http/dto/warehouseId.dto';
import { belowMinThresDto } from '../../interfaces/http/dto/belowMinThres.dto';
import { aboveMaxThresDto } from '../../interfaces/http/dto/aboveMaxThres.dto';
import { productQuantityDto } from '../../interfaces/http/dto/productQuantity.dto';
//import { OrdersController } from "./orders.controller";
//import { OutboundEventAdapter } from "src/infrastructure/adapters/outboundEvent.adapter";
import { InternalOrder } from "src/domain/internalOrder.entity";
import { SellOrder } from "src/domain/sellOrder.entity";
import { OrderItem } from "src/domain/orderItem.entity";
import { OrderItemDetail } from "src/domain/orderItemDetail.entity";
import { OrderState } from "src/domain/orderState.enum";
import { OrderId } from "src/domain/orderId.entity";
import { Orders } from "src/domain/orders.entity";
import { ItemId } from "src/domain/itemId.entity";
import { WarehouseStateDTO } from "src/interfaces/http/dto/warehouseState.dto";
import { WarehouseState } from "src/domain/warehouseState.entity";
import { InternalOrderDTO } from "src/interfaces/http/dto/internalOrder.dto";
import { SellOrderDTO } from "src/interfaces/http/dto/sellOrder.dto";
import { OrderItemDTO } from "src/interfaces/http/dto/orderItem.dto";
import { OrderItemDetailDTO } from "src/interfaces/http/dto/orderItemDetail.dto";
import { OrderStateDTO } from "src/interfaces/http/dto/orderState.dto";
import { OrderIdDTO } from "src/interfaces/http/dto/orderId.dto";
import { OrdersDTO } from "src/interfaces/http/dto/orders.dto";
import { OrderQuantityDTO } from "src/interfaces/http/dto/orderQuantity.dto";
import { OrderQuantity } from 'src/domain/orderQuantity.entity';


export const DataMapper = {
  toDomainProductId(productIdDTO: productIdDto): ProductId {
    return new ProductId(productIdDTO.id);
  },
  toDomainProduct(productDTO: productDto): Product {
    return new Product(
      new ProductId(productDTO.id.id),
      productDTO.name,
      productDTO.unitPrice,
      productDTO.quantity,
      productDTO.minThres,
      productDTO.maxThres,
      DataMapper.warehouseIdToDomain(productDTO.warehouseId),
    );
  },
  
  toDomainInventory(inventoryDTO: inventoryDto): Inventory {
    const products = inventoryDTO.productList.map(DataMapper.toDomainProduct);
    return new Inventory(products);
  },
  toDtoProduct(product: Product): productDto {
    return {
      id: {id : product.getId()},
      name: product.getName(),
      unitPrice: product.getUnitPrice(),
      quantity: product.getQuantity(),
      minThres: product.getMinThres(),
      maxThres: product.getMaxThres(),
      warehouseId : DataMapper.warehouseIdToDto(new WarehouseId(product.getIdWarehouse()))
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
      warehouseId: warehouseId.getId(),
    };
  },
  toBelowMinDTO(product: Product): belowMinThresDto {
    return {
      id: product.getId(),
      quantity: product.getQuantity(),
      minThres: product.getMinThres(),
    };
  },
  toAboveMaxDTO(product: Product): aboveMaxThresDto {
    return {
      id: product.getId(),
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
  // DTO ===> DOMAIN

async internalOrderToDomain(dto: InternalOrderDTO): Promise<InternalOrder> {
  // Validazione: Non si può partire e arrivare allo stesso magazzino
  if (dto.warehouseDeparture === dto.warehouseDestination) {
    throw new Error(`Il magazzino di partenza (${dto.warehouseDeparture}) non può essere uguale alla destinazione`);
  }

  return new InternalOrder(
    await this.orderIdToDomain(dto.orderId), 
    await Promise.all(dto.items.map(i => this.orderItemDetailToDomain(i))), 
    await this.orderStateToDomain(dto.orderState),
    dto.creationDate,
    dto.warehouseDeparture,
    dto.warehouseDestination
  );
},

async sellOrderToDomain(dto: SellOrderDTO): Promise<SellOrder> {
  // TODO: Verifica che l'indirizzo "destinationAddress" sia nel formato giusto
  return new SellOrder(
    await this.orderIdToDomain(dto.orderId),
    await Promise.all(dto.items.map(i => this.orderItemDetailToDomain(i))),
    await this.orderStateToDomain(dto.orderState),
    dto.creationDate,
    dto.warehouseDeparture,
    dto.destinationAddress
  );        
},

async orderItemToDomain(dto: OrderItemDTO): Promise<OrderItem> {
    return new OrderItem(
            new ItemId(dto.itemId.id),
            dto.quantity
        );
},

async orderIdToDomain(dto: OrderIdDTO): Promise<OrderId> {
  const id = dto.id;
  
  const orderIdRegex = /^[SI]\d+$/;
  
  if (!orderIdRegex.test(id)) {
    throw new Error(`Formato OrderId non valido: ${id}. Si accettano solo i formati del tipo S1234 o I5678`);
  }
  return new OrderId(id);
},

async orderStateToDomain(dto: OrderStateDTO): Promise<OrderState> {
  const state = dto.orderState;
  if (!Object.values(OrderState).includes(state as OrderState)) {
    throw new Error(`Stato ordine non valido: ${state}. Stati validi: ${Object.values(OrderState).join(', ')}`);
  }
  return state as OrderState;
},

async orderItemDetailToDomain(dto: OrderItemDetailDTO): Promise<OrderItemDetail> {
  // quantityReserved NON può esser maggiore della quantity totale ordinata
  if (dto.quantityReserved > dto.item.quantity) {
    throw new Error(`Quantità riservata (${dto.quantityReserved}) maggiore della quantità ordinata (${dto.item.quantity})`);
  }

  return new OrderItemDetail(
    await this.orderItemToDomain(dto.item),
    dto.quantityReserved,
    dto.unitPrice
  );
},

// DOMAIN ===> DTO

async internalOrderToDTO(entity: InternalOrder): Promise<InternalOrderDTO> {
    return {
        orderId: await this.orderIdToDTO(entity['orderId']),
        items: await Promise.all(
            entity.getItemsDetail().map(d => this.orderItemDetailToDTO(d))
        ),
        orderState: await this.orderStateToDTO(entity.getOrderState()),
        creationDate: entity.getCreationDate(),
        warehouseDeparture: entity.getWarehouseDeparture(),
        warehouseDestination: entity.getWarehouseDestination(),
        sellOrderId : "" as any
    };
},

async sellOrderToDTO(entity: SellOrder): Promise<SellOrderDTO> {
    return {
        orderId: await this.orderIdToDTO(entity['orderId']),
        items: await Promise.all(
            entity.getItemsDetail().map(d => this.orderItemDetailToDTO(d))
        ),
        orderState: await this.orderStateToDTO(entity.getOrderState()),
        creationDate: entity.getCreationDate(),
        warehouseDeparture: entity.getWarehouseDeparture(),
        destinationAddress: entity.getDestinationAddress()
    };
},

async orderItemToDTO(entity: OrderItem): Promise<OrderItemDTO> {
    return {
        itemId: { id: entity.getItemId() },
        quantity: entity.getQuantity()
    };
},

async orderIdToDTO(entity: OrderId): Promise<OrderIdDTO> {
    return { id: entity.getId() };
},

async orderStateToDTO(state: OrderState): Promise<OrderStateDTO> {
    return { orderState: state };
},

async orderItemDetailToDTO(entity: OrderItemDetail): Promise<OrderItemDetailDTO> {
    return {
        item: await this.orderItemToDTO(entity.getItem()),
        quantityReserved: entity.getQuantityReserved(),
        unitPrice: entity.getUnitPrice()
    };
},

async orderQuantityToDTO(orderId: OrderId, items: OrderItem[]): Promise<OrderQuantityDTO> {
    return {
        id: await this.orderIdToDTO(orderId),
        items: await Promise.all(items.map(i => this.orderItemToDTO(i)))
    };
},
async orderQuantityToDomain(orderQuantity: OrderQuantityDTO): Promise<OrderQuantity> {
    const orderId = new OrderId(orderQuantity.id.id);
    const items = orderQuantity.items.map(
      (i) => new OrderItem(new ItemId(i.itemId.id), i.quantity)
    );
    return new OrderQuantity(orderId, items);
  },
async ordersToDTO(entity: Orders): Promise<OrdersDTO> {
    return {
        sellOrders: await Promise.all(entity.getSellOrders().map(o => this.sellOrderToDTO(o))),
        internalOrders: await Promise.all(entity.getInternalOrders().map(o => this.internalOrderToDTO(o)))
    };
},
async ordersToDomain(dto: OrdersDTO): Promise<Orders> {
  let internalOrders: InternalOrder[] = [];
  let sellOrders : SellOrder[] = [];
    if(dto.internalOrders && dto.internalOrders.length > 0){
        internalOrders = await Promise.all(
        dto.internalOrders.map(o => this.internalOrderToDomain(o))
      );
    }
    if(dto.sellOrders && dto.sellOrders.length > 0) {
        sellOrders = await Promise.all(
        dto.sellOrders.map(o => this.sellOrderToDomain(o))
      );
    }
    return new Orders(internalOrders, sellOrders);
},
productQuantityToDTO(entity: { productId: ProductId; quantity: number }): productQuantityDto {
  return {
    productId: { id: entity.productId.getId() },
    quantity: entity.quantity
  };
},

productQuantityToDomain(dto: productQuantityDto): { productId: ProductId; quantity: number } {
  return {
    productId: new ProductId(dto.productId.id),
    quantity: dto.quantity
  };
},

warehouseIdToDomain(dto: warehouseIdDto): WarehouseId {
  if (!dto.warehouseId || isNaN(dto.warehouseId)) {
    throw new Error(`WarehouseId non valido: ${dto.warehouseId}`);
  }
  return new WarehouseId(dto.warehouseId);
},
warehouseStatetoDomain(dto: WarehouseStateDTO): WarehouseState {
    return new WarehouseState(dto.state, new WarehouseId(dto.warehouseId.warehouseId));
},
warehouseIdToDto(warehouseId: WarehouseId): warehouseIdDto {
  return {
    warehouseId: warehouseId.getId(),
  };
},
warehouseStatetoDto(domain: WarehouseState): WarehouseStateDTO {
    return {
      state: domain.getState(),
      warehouseId: {warehouseId : domain.getId()},
    };
  },
};
